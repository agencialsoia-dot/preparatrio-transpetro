import { createClient } from "@/lib/supabase/server";
import type { AttemptRow } from "@/lib/domain/stats";
import type { Letter } from "@/lib/types/database";

/** Todas as tentativas do usuario, com disciplina/topico resolvidos. */
export async function getAttemptRows(): Promise<AttemptRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, created_at, origin, questions(discipline_id, topic_id, bank, disciplines(name), topics(name))")
    .order("created_at", { ascending: true });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((r) => ({
    question_id: r.question_id,
    is_correct: r.is_correct,
    created_at: r.created_at,
    discipline_id: r.questions?.discipline_id ?? "",
    discipline_name: r.questions?.disciplines?.name ?? "—",
    topic_id: r.questions?.topic_id ?? null,
    topic_name: r.questions?.topics?.name ?? null,
    bank: r.questions?.bank ?? null,
    origin: r.origin ?? undefined,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface WrongQuestionRow {
  question_id: string;
  question_number: number;
  discipline_name: string;
  topic_name: string | null;
  topic_id: string | null;
  exam_slug: string;
  last_wrong_at: string;
  last_error_type: string | null;
  times_wrong: number;
  recurring: boolean; // errada mais de uma vez
}

/**
 * Questoes que o usuario errou e que continuam "erradas": a tentativa mais
 * recente daquela questao foi incorreta. Assim, ao reestudar e acertar, ela
 * sai da lista.
 */
export async function getWrongQuestions(): Promise<WrongQuestionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, created_at, error_type, questions(question_number, topic_id, disciplines(name), topics(name), exams(slug))")
    .order("created_at", { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (data ?? []) as any[];
  const latestByQuestion = new Map<string, any>();
  const wrongCount = new Map<string, number>();
  for (const r of rows) {
    if (!latestByQuestion.has(r.question_id)) latestByQuestion.set(r.question_id, r);
    if (r.is_correct === false) wrongCount.set(r.question_id, (wrongCount.get(r.question_id) ?? 0) + 1);
  }
  return [...latestByQuestion.values()]
    .filter((r) => r.is_correct === false)
    .map((r) => ({
      question_id: r.question_id,
      question_number: r.questions?.question_number ?? 0,
      discipline_name: r.questions?.disciplines?.name ?? "—",
      topic_name: r.questions?.topics?.name ?? null,
      topic_id: r.questions?.topic_id ?? null,
      exam_slug: r.questions?.exams?.slug ?? "",
      last_wrong_at: r.created_at,
      last_error_type: r.error_type ?? null,
      times_wrong: wrongCount.get(r.question_id) ?? 1,
      recurring: (wrongCount.get(r.question_id) ?? 1) > 1,
    }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Ids ja respondidos e ids atualmente "errados" (ultima tentativa incorreta). */
export async function getUserHistory(): Promise<{
  answeredIds: Set<string>;
  wrongIds: Set<string>;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, created_at")
    .order("created_at", { ascending: false });

  const answeredIds = new Set<string>();
  const latest = new Map<string, boolean>();
  for (const r of data ?? []) {
    answeredIds.add(r.question_id);
    if (!latest.has(r.question_id)) latest.set(r.question_id, r.is_correct);
  }
  const wrongIds = new Set<string>();
  for (const [id, ok] of latest) if (!ok) wrongIds.add(id);
  return { answeredIds, wrongIds };
}

export type { Letter };
