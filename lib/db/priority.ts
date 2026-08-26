import { createClient } from "@/lib/supabase/server";
import type { PriorityLevel } from "@/lib/domain/priority";
import {
  computePriorityScore, explainPriority, resolvePriority,
  type PriorityInputs, type ResolvedPriority, type PriorityScore,
} from "@/lib/domain/priority";
import { computeWeakness } from "@/lib/domain/weakness";
import { weightedIncidenceByTopic, describeBase, type ExamSource, type QuestionRef } from "@/lib/domain/incidence";
import { computeStatusWithRecency, type StatusInfo } from "@/lib/domain/status";
import { computeTrend, recentWindow, type Trend } from "@/lib/domain/trend";
import { percent } from "@/lib/domain/scoring";
import { insufficient, type Measure } from "@/lib/domain/measure";
import { getAttemptRows } from "./stats";
import type { AttemptRow } from "@/lib/domain/stats";

export interface TopicPriorityRow {
  id: string;
  name: string;
  code: string | null;
  parent_id: string | null;
  discipline_id: string;
  discipline_name: string;
  discipline_weight: number | null;
  priority_level: PriorityLevel | null;
  edital_relevance: number | null;
  career_relevance: number | null;
  difficulty_level: number | null;
  importance_note: string | null;
  exam_focus_note: string | null;
}

/** Snapshot completo de um tópico — insumo único de todas as telas do módulo. */
export interface TopicSnapshot {
  topicId: string;
  topicName: string;
  code: string | null;
  parentId: string | null;
  disciplineId: string;
  disciplineName: string;
  /** peso da disciplina na prova (LP 10 · MAT 10 · CE 40) */
  disciplineWeight: number;
  priority: ResolvedPriority;
  score: PriorityScore;
  reasons: string[];
  domain: Measure<number>;
  answered: number;
  correct: number;
  questionCount: number;
  status: StatusInfo;
  trend: Trend;
  incidence: Measure<number>;
  wrongCount: number;
  repeatedWrongCount: number;
  importanceNote: string | null;
  examFocusNote: string | null;
}

export async function getTopicPriorityRows(): Promise<TopicPriorityRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("id, name, code, parent_id, discipline_id, priority_level, edital_relevance, career_relevance, difficulty_level, importance_note, exam_focus_note, disciplines(name, exam_weight)")
    .order("order_index");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((t) => ({
    id: t.id, name: t.name, code: t.code, parent_id: t.parent_id,
    discipline_id: t.discipline_id,
    discipline_name: t.disciplines?.name ?? "",
    discipline_weight: t.disciplines?.exam_weight ?? null,
    priority_level: t.priority_level, edital_relevance: t.edital_relevance,
    career_relevance: t.career_relevance, difficulty_level: t.difficulty_level,
    importance_note: t.importance_note, exam_focus_note: t.exam_focus_note,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getExamSources(): Promise<ExamSource[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("exams").select("id, position, source_weight, is_reference");
  return (data ?? []).map((e) => ({
    exam_id: e.id, position: e.position,
    source_weight: Number(e.source_weight ?? 0.5), is_reference: e.is_reference ?? true,
  }));
}

export async function getQuestionRefs(): Promise<QuestionRef[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("questions").select("id, exam_id, topic_id").eq("is_sample", false);
  return (data ?? []).map((q) => ({ question_id: q.id, exam_id: q.exam_id, topic_id: q.topic_id }));
}

/**
 * ORQUESTRADOR ÚNICO. Busca tudo em paralelo (sem N+1 nos 67+ tópicos) e monta
 * os snapshots chamando as funções puras. Toda página do módulo consome daqui.
 */
export async function buildTopicSnapshots(): Promise<TopicSnapshot[]> {
  const [rows, exams, questions, attempts] = await Promise.all([
    getTopicPriorityRows(),
    getExamSources(),
    getQuestionRefs(),
    getAttemptRows(),
  ]);

  const incidence = weightedIncidenceByTopic(questions, exams);
  const base = describeBase(questions, exams);

  // agrupa questões e tentativas por tópico
  const questionsByTopic = new Map<string, string[]>();
  for (const q of questions) {
    if (!q.topic_id) continue;
    questionsByTopic.set(q.topic_id, [...(questionsByTopic.get(q.topic_id) ?? []), q.question_id]);
  }
  const attemptsByTopic = new Map<string, AttemptRow[]>();
  for (const a of attempts) {
    if (!a.topic_id) continue;
    attemptsByTopic.set(a.topic_id, [...(attemptsByTopic.get(a.topic_id) ?? []), a]);
  }

  return rows.map((row) => {
    const tAttempts = attemptsByTopic.get(row.id) ?? [];
    const answered = tAttempts.length;
    const correct = tAttempts.filter((a) => a.is_correct).length;
    const qIds = questionsByTopic.get(row.id) ?? [];
    const answeredIds = new Set(tAttempts.map((a) => a.question_id));

    // erradas: última tentativa incorreta; repetidas: erradas 2+ vezes
    const wrongByQuestion = new Map<string, number>();
    const latestByQuestion = new Map<string, boolean>();
    for (const a of [...tAttempts].sort((x, y) => y.created_at.localeCompare(x.created_at))) {
      if (!latestByQuestion.has(a.question_id)) latestByQuestion.set(a.question_id, a.is_correct);
      if (!a.is_correct) wrongByQuestion.set(a.question_id, (wrongByQuestion.get(a.question_id) ?? 0) + 1);
    }
    const wrongCount = [...latestByQuestion.values()].filter((ok) => !ok).length;
    const repeatedWrongCount = [...wrongByQuestion.values()].filter((n) => n > 1).length;

    const weakness = computeWeakness({
      answered, correct,
      recentAttempts: tAttempts.map((a) => ({ is_correct: a.is_correct, created_at: a.created_at })),
      repeatedWrongCount,
      unansweredCount: qIds.filter((id) => !answeredIds.has(id)).length,
      totalQuestions: qIds.length,
    });

    const topicIncidence = incidence.get(row.id) ?? insufficient<number>(base.questions, 20);

    const inputs: PriorityInputs = {
      historicalFrequency: topicIncidence,
      editalRelevance: row.edital_relevance,
      careerRelevance: row.career_relevance,
      difficultyLevel: row.difficulty_level,
      weakness,
    };
    const score = computePriorityScore(inputs);
    const priority = resolvePriority(row.priority_level, score);
    const accuracy = percent(correct, answered);

    return {
      topicId: row.id, topicName: row.name, code: row.code, parentId: row.parent_id,
      disciplineId: row.discipline_id, disciplineName: row.discipline_name,
      disciplineWeight: row.discipline_weight ?? 0,
      priority, score,
      reasons: explainPriority(inputs, score, priority.level),
      domain: answered > 0 ? { kind: "ok" as const, value: accuracy, sample: answered } : insufficient<number>(0, 1),
      answered, correct,
      questionCount: qIds.length,
      status: computeStatusWithRecency(answered, accuracy, recentWindow(tAttempts)),
      trend: computeTrend(tAttempts),
      incidence: topicIncidence,
      wrongCount, repeatedWrongCount,
      importanceNote: row.importance_note, examFocusNote: row.exam_focus_note,
    };
  });
}

/** Descrição da base histórica, para a UI dizer "base: 1 prova". */
export async function getIncidenceBase() {
  const [exams, questions] = await Promise.all([getExamSources(), getQuestionRefs()]);
  return describeBase(questions, exams);
}

/** Converte snapshots em candidatos do motor de recomendação. */
export function toRecommendationInputs(
  snapshots: TopicSnapshot[],
): import("@/lib/domain/recommendation").RecommendationInput[] {
  const parentIds = new Set(snapshots.map((s) => s.parentId).filter(Boolean) as string[]);
  return snapshots
    .filter((s) => !parentIds.has(s.topicId)) // só folhas competem
    .map((s) => ({
      topicId: s.topicId,
      topicName: s.topicName,
      disciplineName: s.disciplineName,
      disciplineWeight: s.disciplineWeight,
      level: s.priority.level,
      priorityScore: s.score.score,
      domain: s.domain,
      answered: s.answered,
      questionCount: s.questionCount,
      wrongCount: s.wrongCount,
      reasons: s.reasons,
      trendDown: s.trend.direction === "down",
      unit: null, // preenchido quando o Módulo de Conteúdos (F4+) existir
    }));
}
