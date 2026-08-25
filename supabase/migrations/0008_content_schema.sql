-- 0008_content_schema.sql — camada de conteúdo (Unidade de Estudo). Modelo ÚNICO.
-- Tabelas criadas já no Bloco A para que as FKs de questions sejam finais; as telas
-- (Bloco B / V1.6) consomem estas tabelas sem nova migration nem refação.

-- ---------------------------------------------------------- study_units
create table if not exists public.study_units (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references public.topics(id) on delete cascade,
  title        text not null,
  slug         text not null,
  description  text,
  order_index  integer not null default 0,
  source       text,
  source_type  text check (source_type in ('material_oficial','material_proprio','notebooklm','ia','outro')),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (topic_id, slug)
);

-- ------------------------------------------------ study_content_sections
create table if not exists public.study_content_sections (
  id              uuid primary key default gen_random_uuid(),
  study_unit_id   uuid not null references public.study_units(id) on delete cascade,
  title           text not null,
  slug            text not null,
  content_markdown text,
  section_type    text not null default 'other'
    check (section_type in ('concept','fundamentals','formula','example','application',
                            'how_to_solve','common_mistakes','exam_focus','summary','other')),
  order_index     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (study_unit_id, slug)
);

-- ----------------------------------------------------- study_unit_media
create table if not exists public.study_unit_media (
  id               uuid primary key default gen_random_uuid(),
  study_unit_id    uuid not null references public.study_units(id) on delete cascade,
  type             text not null check (type in ('video','audio')),
  title            text,
  url              text not null,
  thumbnail_url    text,
  duration_seconds integer,
  order_index      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------ flashcards
create table if not exists public.flashcards (
  id            uuid primary key default gen_random_uuid(),
  study_unit_id uuid not null references public.study_units(id) on delete cascade,
  front         text not null,
  back          text not null,
  hint          text,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table if not exists public.flashcard_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  result       text not null check (result in ('nao_sabia','duvida','sabia')),
  created_at   timestamptz not null default now()
);

-- --------------------------------------------------------- study_quizzes
create table if not exists public.study_quizzes (
  id            uuid primary key default gen_random_uuid(),
  study_unit_id uuid not null references public.study_units(id) on delete cascade,
  title         text,
  description   text,
  passing_score integer not null default 70,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table if not exists public.study_quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.study_quizzes(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  order_index integer not null default 0,
  unique (quiz_id, question_id)
);
create table if not exists public.study_quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  quiz_id         uuid not null references public.study_quizzes(id) on delete cascade,
  score           numeric(5,2),
  total_questions integer,
  correct_answers integer,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz
);

-- ----------------------------------------------------- study_unit_progress
create table if not exists public.study_unit_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  study_unit_id        uuid not null references public.study_units(id) on delete cascade,
  video_completed      boolean not null default false,
  theory_completed     boolean not null default false,
  audio_completed      boolean not null default false,
  flashcards_completed boolean not null default false,
  quiz_completed       boolean not null default false,
  questions_completed  boolean not null default false,
  review_completed     boolean not null default false,
  quiz_score           numeric(5,2),
  questions_score      numeric(5,2),
  last_step            text,
  last_studied_at      timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, study_unit_id)
);

-- FKs de questions → conteúdo (agora que as tabelas existem)
alter table public.questions
  add constraint questions_study_unit_fk foreign key (study_unit_id)
    references public.study_units(id) on delete set null;
alter table public.questions
  add constraint questions_study_section_fk foreign key (study_section_id)
    references public.study_content_sections(id) on delete set null;

-- --------------------------------------------------------------- índices
create index if not exists sections_unit_idx     on public.study_content_sections (study_unit_id);
create index if not exists media_unit_idx         on public.study_unit_media (study_unit_id);
create index if not exists flashcards_unit_idx     on public.flashcards (study_unit_id);
create index if not exists fc_attempts_user_idx    on public.flashcard_attempts (user_id, flashcard_id);
create index if not exists quiz_questions_quiz_idx  on public.study_quiz_questions (quiz_id);
create index if not exists quiz_attempts_user_idx   on public.study_quiz_attempts (user_id, quiz_id);
create index if not exists unit_progress_user_idx    on public.study_unit_progress (user_id);
create index if not exists study_units_topic_idx     on public.study_units (topic_id);

-- --------------------------------------------------------------- RLS
alter table public.study_units            enable row level security;
alter table public.study_content_sections enable row level security;
alter table public.study_unit_media       enable row level security;
alter table public.flashcards             enable row level security;
alter table public.flashcard_attempts     enable row level security;
alter table public.study_quizzes          enable row level security;
alter table public.study_quiz_questions   enable row level security;
alter table public.study_quiz_attempts    enable row level security;
alter table public.study_unit_progress    enable row level security;

-- Conteúdo: leitura para autenticados; escrita pelo dono (created_by) ou service role.
do $$
declare t text;
begin
  foreach t in array array['study_units','study_content_sections','study_unit_media',
                           'flashcards','study_quizzes','study_quiz_questions'] loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('create policy %I_select on public.%I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- study_units: escrita pelo dono
drop policy if exists study_units_write on public.study_units;
create policy study_units_write on public.study_units for all to authenticated
  using (created_by is null or auth.uid() = created_by)
  with check (created_by is null or auth.uid() = created_by);

-- sub-tabelas de conteúdo: escrita se o usuário é dono da unidade (ou unidade sem dono)
do $$
declare t text; col text;
begin
  foreach t in array array['study_content_sections','study_unit_media','flashcards','study_quizzes'] loop
    execute format($f$
      drop policy if exists %1$I_write on public.%1$I;
      create policy %1$I_write on public.%1$I for all to authenticated
        using (exists (select 1 from public.study_units u
                       where u.id = %1$I.study_unit_id
                         and (u.created_by is null or u.created_by = auth.uid())))
        with check (exists (select 1 from public.study_units u
                       where u.id = %1$I.study_unit_id
                         and (u.created_by is null or u.created_by = auth.uid())));
    $f$, t);
  end loop;
end $$;

drop policy if exists quiz_questions_write on public.study_quiz_questions;
create policy quiz_questions_write on public.study_quiz_questions for all to authenticated
  using (exists (select 1 from public.study_quizzes q join public.study_units u on u.id=q.study_unit_id
                 where q.id = study_quiz_questions.quiz_id and (u.created_by is null or u.created_by = auth.uid())))
  with check (exists (select 1 from public.study_quizzes q join public.study_units u on u.id=q.study_unit_id
                 where q.id = study_quiz_questions.quiz_id and (u.created_by is null or u.created_by = auth.uid())));

-- Dados do usuário: por user_id.
drop policy if exists fc_attempts_rw on public.flashcard_attempts;
create policy fc_attempts_rw on public.flashcard_attempts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists quiz_attempts_rw on public.study_quiz_attempts;
create policy quiz_attempts_rw on public.study_quiz_attempts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists unit_progress_rw on public.study_unit_progress;
create policy unit_progress_rw on public.study_unit_progress for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
