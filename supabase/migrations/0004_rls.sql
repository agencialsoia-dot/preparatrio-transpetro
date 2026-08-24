-- 0004_rls.sql — Row Level Security.
--
-- Conteudo (exams/disciplines/topics/questions): leitura para autenticados,
-- nenhuma politica de escrita. O importador usa a service role, que ignora RLS.
--
-- Dados do usuario: cada linha visivel apenas para o proprio dono.

alter table public.exams                    enable row level security;
alter table public.disciplines              enable row level security;
alter table public.topics                   enable row level security;
alter table public.questions                enable row level security;
alter table public.simulated_exams          enable row level security;
alter table public.simulated_exam_questions enable row level security;
alter table public.question_attempts        enable row level security;

-- ------------------------------------------------ conteudo (read-only)
drop policy if exists exams_select on public.exams;
create policy exams_select on public.exams
  for select to authenticated using (true);

drop policy if exists disciplines_select on public.disciplines;
create policy disciplines_select on public.disciplines
  for select to authenticated using (true);

drop policy if exists topics_select on public.topics;
create policy topics_select on public.topics
  for select to authenticated using (true);

drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
  for select to authenticated using (true);

-- ------------------------------------------------------- simulated_exams
drop policy if exists simulated_exams_select on public.simulated_exams;
create policy simulated_exams_select on public.simulated_exams
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists simulated_exams_insert on public.simulated_exams;
create policy simulated_exams_insert on public.simulated_exams
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists simulated_exams_update on public.simulated_exams;
create policy simulated_exams_update on public.simulated_exams
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists simulated_exams_delete on public.simulated_exams;
create policy simulated_exams_delete on public.simulated_exams
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------- simulated_exam_questions
-- Acesso derivado do simulado dono.
drop policy if exists seq_select on public.simulated_exam_questions;
create policy seq_select on public.simulated_exam_questions
  for select to authenticated using (
    exists (select 1 from public.simulated_exams s
            where s.id = simulated_exam_id and s.user_id = auth.uid())
  );

drop policy if exists seq_insert on public.simulated_exam_questions;
create policy seq_insert on public.simulated_exam_questions
  for insert to authenticated with check (
    exists (select 1 from public.simulated_exams s
            where s.id = simulated_exam_id and s.user_id = auth.uid())
  );

drop policy if exists seq_update on public.simulated_exam_questions;
create policy seq_update on public.simulated_exam_questions
  for update to authenticated using (
    exists (select 1 from public.simulated_exams s
            where s.id = simulated_exam_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.simulated_exams s
            where s.id = simulated_exam_id and s.user_id = auth.uid())
  );

-- ----------------------------------------------------- question_attempts
-- Append-only: sem update/delete, nem para o dono.
drop policy if exists attempts_select on public.question_attempts;
create policy attempts_select on public.question_attempts
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists attempts_insert on public.question_attempts;
create policy attempts_insert on public.question_attempts
  for insert to authenticated with check (auth.uid() = user_id);
