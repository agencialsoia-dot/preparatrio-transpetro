-- 0003_indexes.sql — indices para as consultas do app.

create index if not exists questions_exam_number_idx
  on public.questions (exam_id, question_number);
create index if not exists questions_discipline_idx
  on public.questions (discipline_id);
create index if not exists questions_topic_idx
  on public.questions (topic_id);

create index if not exists topics_discipline_idx on public.topics (discipline_id);
create index if not exists topics_parent_idx     on public.topics (parent_id);

-- /historico e agregacoes do dashboard
create index if not exists attempts_user_created_idx
  on public.question_attempts (user_id, created_at desc);
-- "ja respondi esta questao?" (modo estudo) e /erros
create index if not exists attempts_user_question_idx
  on public.question_attempts (user_id, question_id);
-- filtro do modo estudo por acerto/erro
create index if not exists attempts_user_correct_idx
  on public.question_attempts (user_id, is_correct);

create index if not exists simulated_exams_user_started_idx
  on public.simulated_exams (user_id, started_at desc);
create index if not exists seq_simulado_order_idx
  on public.simulated_exam_questions (simulated_exam_id, question_order);
