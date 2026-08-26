import { createClient } from "@/lib/supabase/server";
import type { SimulatedExam, SimulatedExamQuestion, Letter } from "@/lib/types/database";
import type { GradableQuestion } from "@/lib/domain/scoring";

/**
 * Questao servida durante o simulado — SEM gabarito. A selecao de colunas e
 * intencional: correct_answer e explanation nunca chegam ao cliente antes de
 * finalizar. Ver docs / plano.
 */
export interface RunnerQuestion {
  seq_id: string;
  question_id: string;
  question_order: number;
  question_number: number;
  discipline_name: string;
  statement: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  selected_answer: Letter | null;
}

export async function getSimulado(id: string): Promise<SimulatedExam | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("simulated_exams").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function listSimulados(): Promise<(SimulatedExam & { exam_name: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("simulated_exams")
    .select("*, exams(name)")
    .order("started_at", { ascending: false });
  return (data ?? []).map((s) => {
    const { exams, ...rest } = s as SimulatedExam & { exams: { name: string } | null };
    return { ...rest, exam_name: exams?.name ?? "Prova" };
  });
}

/** Questoes do runner, sem gabarito, na ordem do simulado. */
export async function getRunnerQuestions(simuladoId: string): Promise<RunnerQuestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("simulated_exam_questions")
    .select(
      "id, question_id, question_order, selected_answer, " +
        "questions(question_number, statement, image_url, option_a, option_b, option_c, option_d, option_e, disciplines(name))",
    )
    .eq("simulated_exam_id", simuladoId)
    .order("question_order");

  type Row = {
    id: string;
    question_id: string;
    question_order: number;
    selected_answer: Letter | null;
    questions: {
      question_number: number;
      statement: string;
      image_url: string | null;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      option_e: string | null;
      disciplines: { name: string } | null;
    } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    seq_id: r.id,
    question_id: r.question_id,
    question_order: r.question_order,
    question_number: r.questions?.question_number ?? r.question_order,
    discipline_name: r.questions?.disciplines?.name ?? "",
    statement: r.questions?.statement ?? "",
    image_url: r.questions?.image_url ?? null,
    option_a: r.questions?.option_a ?? "",
    option_b: r.questions?.option_b ?? "",
    option_c: r.questions?.option_c ?? "",
    option_d: r.questions?.option_d ?? "",
    option_e: r.questions?.option_e ?? null,
    selected_answer: r.selected_answer,
  }));
}

/** Questoes COM gabarito — apenas para correcao/revisao apos finalizar. */
export async function getGradableQuestions(simuladoId: string): Promise<
  (GradableQuestion & {
    statement: string;
    image_url: string | null;
    options: Record<Letter, string | null>;
    explanation: string | null;
    explanation_source: string | null;
    is_correct: boolean | null;
  })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("simulated_exam_questions")
    .select(
      "question_id, question_order, selected_answer, is_correct, " +
        "questions(question_number, statement, image_url, correct_answer, explanation, explanation_source, " +
        "option_a, option_b, option_c, option_d, option_e, " +
        "discipline_id, topic_id, disciplines(name), topics(name))",
    )
    .eq("simulated_exam_id", simuladoId)
    .order("question_order");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((r) => {
    const q = r.questions ?? {};
    return {
      question_id: r.question_id,
      question_number: q.question_number ?? r.question_order,
      question_order: r.question_order,
      discipline_id: q.discipline_id ?? "",
      discipline_name: q.disciplines?.name ?? "",
      topic_id: q.topic_id ?? null,
      topic_name: q.topics?.name ?? null,
      correct_answer: q.correct_answer as Letter,
      selected_answer: r.selected_answer as Letter | null,
      is_correct: r.is_correct as boolean | null,
      statement: q.statement ?? "",
      image_url: q.image_url ?? null,
      options: {
        A: q.option_a ?? null,
        B: q.option_b ?? null,
        C: q.option_c ?? null,
        D: q.option_d ?? null,
        E: q.option_e ?? null,
      } as Record<Letter, string | null>,
      explanation: q.explanation ?? null,
      explanation_source: q.explanation_source ?? null,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export type { SimulatedExamQuestion };
