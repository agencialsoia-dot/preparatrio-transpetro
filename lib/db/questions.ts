import { createClient } from "@/lib/supabase/server";
import type { Letter } from "@/lib/types/database";

/** Questao completa para o Modo Estudo (com gabarito — correcao e imediata). */
export interface StudyQuestion {
  id: string;
  question_number: number;
  discipline_name: string;
  topic_name: string | null;
  statement: string;
  options: { letter: Letter; text: string }[];
  correct_answer: Letter;
  explanation: string | null;
  explanation_source: string | null;
}

/** Ids candidatos ao filtro de disciplina/topico (sem aplicar o modo). */
export async function getCandidateQuestionIds(filter: {
  disciplineId: string | null;
  topicId: string | null;
}): Promise<string[]> {
  const supabase = await createClient();
  let query = supabase.from("questions").select("id").order("question_number");
  if (filter.disciplineId) query = query.eq("discipline_id", filter.disciplineId);
  if (filter.topicId) query = query.eq("topic_id", filter.topicId);
  const { data } = await query;
  return (data ?? []).map((r) => r.id);
}

export async function getStudyQuestions(ids: string[]): Promise<StudyQuestion[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select(
      "id, question_number, statement, correct_answer, explanation, explanation_source, " +
        "option_a, option_b, option_c, option_d, option_e, disciplines(name), topics(name)",
    )
    .in("id", ids);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const byId = new Map<string, StudyQuestion>();
  for (const q of (data ?? []) as any[]) {
    const opts: { letter: Letter; text: string }[] = [
      { letter: "A", text: q.option_a },
      { letter: "B", text: q.option_b },
      { letter: "C", text: q.option_c },
      { letter: "D", text: q.option_d },
    ];
    if (q.option_e) opts.push({ letter: "E", text: q.option_e });
    byId.set(q.id, {
      id: q.id,
      question_number: q.question_number,
      discipline_name: q.disciplines?.name ?? "",
      topic_name: q.topics?.name ?? null,
      statement: q.statement,
      options: opts,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      explanation_source: q.explanation_source,
    });
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  // Preserva a ordem dos ids solicitados.
  return ids.map((id) => byId.get(id)).filter((q): q is StudyQuestion => !!q);
}
