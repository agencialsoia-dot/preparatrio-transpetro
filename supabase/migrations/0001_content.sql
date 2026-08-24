-- 0001_content.sql — tabelas de conteudo (provas, disciplinas, topicos, questoes).
-- Conteudo e global e somente-leitura para usuarios autenticados; a escrita acontece
-- exclusivamente via service role (scripts/import-questions.ts).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- exams
create table if not exists public.exams (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  organization    text,
  bank            text,
  year            integer,
  category        text,
  description     text,
  total_questions integer,
  -- true = prova real aplicada (aparece no bloco "PROVAS REAIS")
  is_real_exam    boolean not null default false,
  -- true = conteudo de amostra/demonstracao, NAO e a prova oficial
  is_sample       boolean not null default false,
  created_at      timestamptz not null default now()
);

comment on column public.exams.is_sample is
  'Conteudo ilustrativo de demonstracao. Nunca deve ser apresentado como prova oficial.';

-- --------------------------------------------------------- disciplines
create table if not exists public.disciplines (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  order_index integer not null default 0
);

-- -------------------------------------------------------------- topics
-- parent_id permite hierarquia livre:
--   Conhecimentos Especificos > Instrumentacao > Medicao
create table if not exists public.topics (
  id            uuid primary key default gen_random_uuid(),
  discipline_id uuid not null references public.disciplines(id) on delete cascade,
  parent_id     uuid references public.topics(id) on delete cascade,
  name          text not null,
  order_index   integer not null default 0,
  unique (discipline_id, name)
);

-- ----------------------------------------------------------- questions
create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  exam_id         uuid not null references public.exams(id) on delete cascade,
  discipline_id   uuid not null references public.disciplines(id) on delete restrict,
  topic_id        uuid references public.topics(id) on delete set null,
  question_number integer not null,
  statement       text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  option_e        text,
  correct_answer  char(1) not null check (correct_answer in ('A','B','C','D','E')),
  explanation     text,
  -- 'oficial' | 'ia' | null. A UI rotula explicitamente explicacoes geradas por IA.
  explanation_source text check (explanation_source in ('oficial','ia')),
  source          text,
  year            integer,
  bank            text,
  difficulty      smallint check (difficulty between 1 and 5),
  is_sample       boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (exam_id, question_number),
  -- a alternativa correta precisa existir de fato
  constraint questions_correct_answer_exists
    check (correct_answer <> 'E' or option_e is not null)
);

comment on column public.questions.explanation_source is
  'oficial = explicacao do material importado; ia = gerada por IA (rotulada na UI).';
