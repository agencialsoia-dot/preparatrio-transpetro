import { createClient } from "@/lib/supabase/server";
import type { Letter, QuestionCategory } from "@/lib/types/database";

/** Questao completa para resolução (Modo Estudo / Banco / Revisão) — com gabarito. */
export interface StudyQuestion {
  id: string;
  question_number: number;
  discipline_name: string;
  topic_name: string | null;
  statement: string;
  image_url: string | null;
  options: { letter: Letter; text: string }[];
  correct_answer: Letter;
  explanation: string | null;
  explanation_source: string | null;
  category: QuestionCategory;
  bank: string | null;
  year: number | null;
  exam_name: string | null;
}

export interface QuestionBankFilter {
  disciplineId?: string | null;
  topicId?: string | null;
  bank?: string | null;
  year?: number | null;
  difficulty?: number | null;
  category?: QuestionCategory | null;
}

/** Ids candidatos ao filtro estrutural (sem aplicar modo/status, resolvido no domínio). */
export async function getCandidateQuestionIds(filter: QuestionBankFilter): Promise<string[]> {
  const supabase = await createClient();
  let query = supabase.from("questions").select("id").order("question_number");
  if (filter.disciplineId) query = query.eq("discipline_id", filter.disciplineId);
  if (filter.topicId) query = query.eq("topic_id", filter.topicId);
  if (filter.bank) query = query.eq("bank", filter.bank);
  if (filter.year) query = query.eq("year", filter.year);
  if (filter.difficulty) query = query.eq("difficulty", filter.difficulty);
  if (filter.category) query = query.eq("question_category", filter.category);
  const { data } = await query;
  return (data ?? []).map((r) => r.id);
}

export async function getStudyQuestions(ids: string[]): Promise<StudyQuestion[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select(
      "id, question_number, statement, image_url, correct_answer, explanation, explanation_source, " +
        "question_category, bank, year, option_a, option_b, option_c, option_d, option_e, " +
        "disciplines(name), topics(name), exams(name)",
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
      image_url: q.image_url ?? null,
      options: opts,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      explanation_source: q.explanation_source,
      category: q.question_category ?? "prova_real",
      bank: q.bank ?? null,
      year: q.year ?? null,
      exam_name: q.exams?.name ?? null,
    });
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return ids.map((id) => byId.get(id)).filter((q): q is StudyQuestion => !!q);
}
