"use server";

import { createClient } from "@/lib/supabase/server";
import type { Letter, ErrorType } from "@/lib/types/database";
import { isErrorType } from "@/lib/domain/errors";

/**
 * Registra uma resposta do Modo Estudo/Banco e devolve a correção imediata.
 * Grava direto em question_attempts (origin='estudo') e retorna o id da tentativa
 * para permitir classificar o erro em seguida.
 */
export async function responderEstudo(
  questionId: string,
  selected: Letter,
): Promise<{
  ok: boolean; attempt_id?: string; is_correct?: boolean; correct_answer?: Letter;
  explanation?: string | null; explanation_source?: string | null; error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada." };

  const { data: q } = await supabase
    .from("questions")
    .select("correct_answer, explanation, explanation_source")
    .eq("id", questionId)
    .single();
  if (!q) return { ok: false, error: "Questão não encontrada." };

  const isCorrect = selected === q.correct_answer;

  const { data: inserted, error } = await supabase
    .from("question_attempts")
    .insert({
      user_id: user.id,
      question_id: questionId,
      selected_answer: selected,
      is_correct: isCorrect,
      origin: "estudo",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    attempt_id: inserted?.id,
    is_correct: isCorrect,
    correct_answer: q.correct_answer as Letter,
    explanation: q.explanation,
    explanation_source: q.explanation_source,
  };
}

/** Classifica o motivo do erro de uma tentativa (§16). Append-only permite update do próprio dono? Não —
 * question_attempts é insert/select apenas. Então gravamos error_type no próprio insert seria ideal,
 * mas como a classificação vem após ver o resultado, usamos uma policy de update do dono.
 */
export async function classificarErro(
  attemptId: string,
  errorType: ErrorType,
): Promise<{ ok: boolean; error?: string }> {
  if (!isErrorType(errorType)) return { ok: false, error: "Tipo inválido." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada." };
  const { error } = await supabase
    .from("question_attempts")
    .update({ error_type: errorType })
    .eq("id", attemptId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
