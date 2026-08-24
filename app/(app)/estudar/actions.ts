"use server";

import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/lib/types/database";

/**
 * Registra uma resposta do Modo Estudo e devolve a correcao imediata.
 * Grava direto em question_attempts (origin='estudo').
 */
export async function responderEstudo(
  questionId: string,
  selected: Letter,
): Promise<{ ok: boolean; is_correct?: boolean; correct_answer?: Letter; explanation?: string | null; explanation_source?: string | null; error?: string }> {
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

  const { error } = await supabase.from("question_attempts").insert({
    user_id: user.id,
    question_id: questionId,
    selected_answer: selected,
    is_correct: isCorrect,
    origin: "estudo",
  });
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    is_correct: isCorrect,
    correct_answer: q.correct_answer as Letter,
    explanation: q.explanation,
    explanation_source: q.explanation_source,
  };
}
