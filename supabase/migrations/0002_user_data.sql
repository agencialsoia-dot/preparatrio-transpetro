-- 0002_user_data.sql — dados por usuario: tentativas, simulados e respostas do simulado.

-- ---------------------------------------------------- simulated_exams
create table if not exists public.simulated_exams (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  exam_id           uuid not null references public.exams(id) on delete cascade,
  title             text not null,
  status            text not null default 'em_andamento'
                    check (status in ('em_andamento','finalizado')),
  started_at        timestamptz not null default now(),
  finished_at       timestamptz,
  total_questions   integer not null,
  correct_answers   integer,
  wrong_answers     integer,
  score_percentage  numeric(5,2),
  total_time_seconds integer
);

-- ------------------------------------------- simulated_exam_questions
-- Espelho congelado da prova: ordem das questoes e a resposta marcada.
-- is_correct permanece NULL enquanto o simulado esta em andamento — e so
-- preenchido na finalizacao, junto com o gabarito.
create table if not exists public.simulated_exam_questions (
  id                 uuid primary key default gen_random_uuid(),
  simulated_exam_id  uuid not null references public.simulated_exams(id) on delete cascade,
  question_id        uuid not null references public.questions(id) on delete cascade,
  question_order     integer not null,
  selected_answer    char(1) check (selected_answer in ('A','B','C','D','E')),
  is_correct         boolean,
  time_spent_seconds integer,
  answered_at        timestamptz,
  unique (simulated_exam_id, question_id),
  unique (simulated_exam_id, question_order)
);

-- --------------------------------------------------- question_attempts
-- Log append-only. E a fonte unica de verdade para TODA estatistica de
-- desempenho (dashboard, /desempenho, /erros, /historico).
create table if not exists public.question_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  question_id        uuid not null references public.questions(id) on delete cascade,
  selected_answer    char(1) not null check (selected_answer in ('A','B','C','D','E')),
  is_correct         boolean not null,
  time_spent_seconds integer,
  confidence         text check (confidence in ('confiante','duvida','chute')),
  origin             text not null check (origin in ('simulado','estudo')),
  simulated_exam_id  uuid references public.simulated_exams(id) on delete set null,
  created_at         timestamptz not null default now()
);

comment on table public.question_attempts is
  'Append-only. Cada resposta do usuario, no simulado ou no modo estudo.';
