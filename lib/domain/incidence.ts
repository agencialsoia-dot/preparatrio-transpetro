import { insufficient, ok, type Measure } from "./measure.ts";

/**
 * Incidência histórica — quanto cada tópico foi cobrado nas provas analisadas,
 * ponderado pela proximidade do cargo.
 *
 * ATENÇÃO CONCEITUAL: incidência histórica NÃO é previsão. Um tópico com 90%
 * de incidência não tem 90% de chance de cair. A UI deve rotular como
 * "incidência histórica", nunca como probabilidade.
 */

export interface ExamSource {
  exam_id: string;
  position: string | null;
  /** 0–1: Dutos e Terminais = 1.0, Técnico de Operação ≈ 0.7, outros ≈ 0.4 */
  source_weight: number;
  /** amostras/demonstração ficam fora da estatística */
  is_reference: boolean;
}

export interface QuestionRef {
  question_id: string;
  exam_id: string | null;
  topic_id: string | null;
}

/** Pesos padrão por proximidade do cargo. Configuráveis via coluna em `exams`. */
export const DEFAULT_SOURCE_WEIGHTS: Record<string, number> = {
  dutos_terminais: 1.0,
  tecnico_operacao: 0.7,
  outro: 0.4,
};

/** Base mínima para que a incidência signifique alguma coisa. */
export const MIN_QUESTIONS_FOR_INCIDENCE = 20;
/** Uma prova só não é histórico — é uma amostra. */
export const MIN_EXAMS_FOR_INCIDENCE = 2;

export interface IncidenceBase {
  exams: number;
  questions: number;
  sufficient: boolean;
}

/** Descreve a base disponível, para a UI poder dizer "base: 1 prova". */
export function describeBase(
  questions: readonly QuestionRef[],
  exams: readonly ExamSource[],
): IncidenceBase {
  const refIds = new Set(exams.filter((e) => e.is_reference).map((e) => e.exam_id));
  const qs = questions.filter((q) => q.exam_id && refIds.has(q.exam_id));
  const usedExams = new Set(qs.map((q) => q.exam_id));
  return {
    exams: usedExams.size,
    questions: qs.length,
    sufficient:
      usedExams.size >= MIN_EXAMS_FOR_INCIDENCE && qs.length >= MIN_QUESTIONS_FOR_INCIDENCE,
  };
}

/**
 * Incidência ponderada por tópico, 0–100 (soma ≈ 100 entre os tópicos).
 *
 * Enquanto a base não atingir o mínimo, TODOS os tópicos voltam `insufficient` —
 * é o caso de hoje (1 prova). Preferimos não dizer nada a dizer um número frágil.
 */
export function weightedIncidenceByTopic(
  questions: readonly QuestionRef[],
  exams: readonly ExamSource[],
): Map<string, Measure<number>> {
  const out = new Map<string, Measure<number>>();
  const base = describeBase(questions, exams);
  const weightByExam = new Map(
    exams.filter((e) => e.is_reference).map((e) => [e.exam_id, e.source_weight]),
  );

  const perTopic = new Map<string, { weight: number; count: number }>();
  let totalWeight = 0;
  for (const q of questions) {
    if (!q.exam_id || !q.topic_id) continue;
    const w = weightByExam.get(q.exam_id);
    if (w == null) continue;
    const acc = perTopic.get(q.topic_id) ?? { weight: 0, count: 0 };
    acc.weight += w;
    acc.count += 1;
    perTopic.set(q.topic_id, acc);
    totalWeight += w;
  }

  for (const [topicId, acc] of perTopic) {
    if (!base.sufficient || totalWeight <= 0) {
      out.set(topicId, insufficient(base.questions, MIN_QUESTIONS_FOR_INCIDENCE));
    } else {
      const pct = Math.round((acc.weight / totalWeight) * 1000) / 10;
      out.set(topicId, ok(pct, acc.count));
    }
  }
  return out;
}

/** Contagem bruta de questões por tópico — sempre disponível, mesmo sem base estatística. */
export function questionCountByTopic(questions: readonly QuestionRef[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const q of questions) {
    if (!q.topic_id) continue;
    m.set(q.topic_id, (m.get(q.topic_id) ?? 0) + 1);
  }
  return m;
}
