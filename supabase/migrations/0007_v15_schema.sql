-- 0007_v15_schema.sql — extensões do schema para a V1.5 (aditivas, não destrutivas).

-- ---------------------------------------------------------------- topics
alter table public.topics add column if not exists code text;         -- nº do edital, ex. "CE-12"
alter table public.topics add column if not exists description text;

-- -------------------------------------------------------------- questions
alter table public.questions add column if not exists image_url text;  -- figura da questão (public/)
alter table public.questions add column if not exists question_category text
  not null default 'prova_real'
  check (question_category in ('prova_real','questao_banca','questao_adaptada','questao_inedita'));
-- relação questão↔conteúdo já no schema final (FKs adicionadas em 0008, após as tabelas existirem)
alter table public.questions add column if not exists study_unit_id uuid;
alter table public.questions add column if not exists study_section_id uuid;

-- ------------------------------------------------------- question_attempts
alter table public.question_attempts add column if not exists error_type text
  check (error_type in
    ('nao_sabia','confundiu_conceito','erro_calculo','erro_interpretacao','chute','nao_classificado'));

-- --------------------------------------------------------------- índices
create index if not exists questions_category_idx    on public.questions (question_category);
create index if not exists questions_study_unit_idx  on public.questions (study_unit_id);
create index if not exists attempts_error_type_idx   on public.question_attempts (user_id, error_type);
