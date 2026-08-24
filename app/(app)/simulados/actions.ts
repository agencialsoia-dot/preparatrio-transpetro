"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seededShuffle } from "@/lib/domain/shuffle";
import { scoreSimulado, type GradableQuestion } from "@/lib/domain/scoring";
import type { Letter } from "@/lib/types/database";

/**
 * Cria um simulado da prova inteira e congela a ordem das questoes.
 * Redireciona para o runner.
 */
export async function iniciarSimulado(examId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exam } = await supabase.from("exams").select("*").eq("id", examId).single();
  if (!exam) throw new Error("Prova não encontrada.");

  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .eq("exam_id", examId)
    .order("question_number");
  if (!questions || questions.length === 0) {
    throw new Error("Esta prova ainda não tem questões importadas.");
  }

  const { data: sim, error } = await supabase
    .from("simulated_exams")
    .insert({
      user_id: user.id,
      exam_id: examId,
      title: exam.name,
      total_questions: questions.length,
      status: "em_andamento",
    })
    .select("id")
    .single();
  if (error || !sim) throw new Error(error?.message ?? "Falha ao criar o simulado.");

  // Ordem estavel derivada do id do simulado.
  const ordered = seededShuffle(questions.map((q) => q.id), sim.id);
  const rows = ordered.map((qid, i) => ({
    simulated_exam_id: sim.id,
    question_id: qid,
    question_order: i + 1,
  }));
  const { error: seqErr } = await supabase.from("simulated_exam_questions").insert(rows);
  if (seqErr) throw new Error(seqErr.message);

  redirect(`/simulados/${sim.id}`);
}

/** Salva a resposta de uma questao (sem revelar acerto). Chamada a cada clique. */
export async function salvarResposta(
  simuladoId: string,
  questionId: string,
  selected: Letter,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("simulated_exam_questions")
    .update({ selected_answer: selected, answered_at: new Date().toISOString() })
    .eq("simulated_exam_id", simuladoId)
    .eq("question_id", questionId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/**
 * Finaliza o simulado: corrige tudo, grava o resultado e registra as 60
 * tentativas em question_attempts. Idempotente — se ja finalizado, so redireciona.
 * O tempo total e calculado no servidor a partir de started_at.
 */
export async function finalizarSimulado(simuladoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sim } = await supabase
    .from("simulated_exams")
    .select("*")
    .eq("id", simuladoId)
    .single();
  if (!sim) throw new Error("Simulado não encontrado.");
  if (sim.status === "finalizado") {
    redirect(`/simulados/${simuladoId}/resultado`);
  }

  const { data: seq } = await supabase
    .from("simulated_exam_questions")
    .select("question_id, question_order, selected_answer, questions(question_number, correct_answer, discipline_id)")
    .eq("simulated_exam_id", simuladoId)
    .order("question_order");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const gradable: GradableQuestion[] = ((seq ?? []) as any[]).map((r) => ({
    question_id: r.question_id,
    question_number: r.questions?.question_number ?? r.question_order,
    question_order: r.question_order,
    discipline_id: r.questions?.discipline_id ?? "",
    discipline_name: "",
    topic_id: null,
    topic_name: null,
    correct_answer: r.questions?.correct_answer as Letter,
    selected_answer: r.selected_answer as Letter | null,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const score = scoreSimulado(gradable);
  const finishedAt = new Date();
  const totalTime = Math.max(
    0,
    Math.floor((finishedAt.getTime() - new Date(sim.started_at).getTime()) / 1000),
  );

  // Marca is_correct em cada questao do simulado.
  for (const g of gradable) {
    await supabase
      .from("simulated_exam_questions")
      .update({ is_correct: g.selected_answer != null && g.selected_answer === g.correct_answer })
      .eq("simulated_exam_id", simuladoId)
      .eq("question_id", g.question_id);
  }

  // Registra tentativas (fonte de todas as estatisticas). Apenas questoes respondidas.
  const attempts = gradable
    .filter((g) => g.selected_answer != null)
    .map((g) => ({
      user_id: user.id,
      question_id: g.question_id,
      selected_answer: g.selected_answer as Letter,
      is_correct: g.selected_answer === g.correct_answer,
      origin: "simulado" as const,
      simulated_exam_id: simuladoId,
    }));
  if (attempts.length > 0) {
    await supabase.from("question_attempts").insert(attempts);
  }

  await supabase
    .from("simulated_exams")
    .update({
      status: "finalizado",
      finished_at: finishedAt.toISOString(),
      correct_answers: score.correct,
      wrong_answers: score.wrong + score.blank,
      score_percentage: score.percentage,
      total_time_seconds: totalTime,
    })
    .eq("id", simuladoId);

  revalidatePath("/dashboard");
  revalidatePath("/historico");
  redirect(`/simulados/${simuladoId}/resultado`);
}
