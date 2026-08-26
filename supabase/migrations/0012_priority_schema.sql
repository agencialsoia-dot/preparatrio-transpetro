-- 0012: camada de prioridade pós-edital. Aditiva; nenhum dado é alterado ou removido.

-- ---------------------------------------------------------------- exams
-- Peso por proximidade do cargo: uma questão da prova de Dutos e Terminais vale
-- mais como evidência do que uma de outro cargo técnico.
alter table public.exams add column if not exists position text;
alter table public.exams add column if not exists source_weight numeric(4,2) not null default 0.50
  check (source_weight >= 0 and source_weight <= 1);
alter table public.exams add column if not exists is_reference boolean not null default true;

update public.exams set position = 'dutos_terminais', source_weight = 1.00
  where slug = 'transpetro-2023-dutos-e-terminais';
-- amostra de demonstração nunca entra na estatística de incidência
update public.exams set is_reference = false where is_sample = true;

-- ----------------------------------------------------------- disciplines
-- Peso da disciplina na prova (fato da estrutura: 10 + 10 + 40 = 60).
alter table public.disciplines add column if not exists exam_weight smallint;
update public.disciplines set exam_weight = 10 where name = 'Língua Portuguesa';
update public.disciplines set exam_weight = 10 where name = 'Matemática';
update public.disciplines set exam_weight = 40 where name = 'Conhecimentos Específicos';

-- ---------------------------------------------------------------- topics
-- Componentes do score guardados SEPARADAMENTE, para permitir recalcular sem
-- perder os insumos. priority_level null = ainda não classificado (≠ P4).
alter table public.topics add column if not exists priority_level text
  check (priority_level in ('P1','P2','P3','P4'));
alter table public.topics add column if not exists historical_frequency smallint
  check (historical_frequency between 0 and 100);
alter table public.topics add column if not exists edital_relevance smallint
  check (edital_relevance between 0 and 100);
alter table public.topics add column if not exists career_relevance smallint
  check (career_relevance between 0 and 100);
alter table public.topics add column if not exists difficulty_level smallint
  check (difficulty_level between 1 and 5);
alter table public.topics add column if not exists importance_note text;
alter table public.topics add column if not exists exam_focus_note text;

-- ----------------------------------------------------------- study_units
alter table public.study_units add column if not exists priority_level text
  check (priority_level in ('P1','P2','P3','P4'));
alter table public.study_units add column if not exists estimated_minutes smallint;
-- permite autoria incremental sem vazar rascunho para a trilha do aluno
alter table public.study_units add column if not exists is_published boolean not null default false;

-- -------------------------------------------------- study_unit_progress
alter table public.study_unit_progress add column if not exists errors_reviewed_count smallint not null default 0;
alter table public.study_unit_progress add column if not exists consolidated_at timestamptz;
