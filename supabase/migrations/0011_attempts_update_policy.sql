-- 0011: permite ao dono atualizar a própria tentativa (usado apenas para gravar
-- error_type após ver o resultado). Mantém o espírito append-only na aplicação.
drop policy if exists attempts_update on public.question_attempts;
create policy attempts_update on public.question_attempts
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
