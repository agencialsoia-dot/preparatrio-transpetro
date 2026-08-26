import { isOk, type Measure } from "./measure.ts";
import type { PriorityLevel } from "./priority.ts";

/**
 * Motor de recomendação — a ÚNICA função que cruza prioridade, domínio e trilha.
 * Nenhum componente React decide o que estudar.
 */

export type RecommendedAction =
  | "study_theory"     // conteúdo cadastrado e não iniciado
  | "flashcards"
  | "quiz"
  | "questions"        // resolver questões (o caminho padrão hoje: sem conteúdo)
  | "review_errors"    // dívida: erros pendentes
  | "redo"             // consolidado mas regredindo
  | "maintenance"      // domínio alto: manutenção periódica
  | "await_content";   // prioritário mas sem conteúdo nem questões

export const ACTION_LABELS: Record<RecommendedAction, string> = {
  study_theory: "Estudar a teoria",
  flashcards: "Fazer os flashcards",
  quiz: "Fazer o teste final",
  questions: "Resolver questões",
  review_errors: "Revisar seus erros",
  redo: "Refazer questões erradas",
  maintenance: "Questões de manutenção",
  await_content: "Conteúdo ainda não cadastrado",
};

/** O que a unidade de estudo oferece — sem conteúdo, a trilha não é caminho. */
export interface UnitState {
  id: string;
  title: string;
  hasTheory: boolean;
  theoryDone: boolean;
  hasFlashcards: boolean;
  flashcardsDone: boolean;
  hasQuiz: boolean;
  quizDone: boolean;
  lastStudiedAt: string | null;
}

export interface RecommendationInput {
  topicId: string;
  topicName: string;
  disciplineName: string;
  disciplineWeight: number;
  level: PriorityLevel;
  priorityScore: number;
  domain: Measure<number>;
  answered: number;
  questionCount: number;
  wrongCount: number;
  reasons: string[];
  trendDown: boolean;
  unit: UnitState | null;
}

export interface Recommendation {
  topicId: string;
  studyUnitId?: string;
  title: string;
  reason: string[];
  priorityScore: number;
  level: PriorityLevel;
  domain: Measure<number>;
  recommendedAction: RecommendedAction;
  actionLabel: string;
  /** rota para onde o botão deve levar */
  href: string;
}

/** Domínio a partir do qual o assunto entra em manutenção. */
export const MAINTENANCE_THRESHOLD = 85;
/** Abaixo disso, um tópico prioritário dispara alerta. */
export const LOW_DOMAIN_THRESHOLD = 70;

const RANK: Record<PriorityLevel, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

function decideAction(c: RecommendationInput): RecommendedAction {
  // 1. dívida primeiro: erros pendentes em tópico prioritário
  if (c.wrongCount > 0 && RANK[c.level] <= 2) return "review_errors";
  // 2. conteúdo publicado e ainda não estudado
  if (c.unit?.hasTheory && !c.unit.theoryDone) return "study_theory";
  // 3. trilha incompleta
  if (c.unit?.hasFlashcards && !c.unit.flashcardsDone) return "flashcards";
  if (c.unit?.hasQuiz && !c.unit.quizDone) return "quiz";
  // 4. sem base de desempenho e há questões → medir
  if (c.questionCount > 0 && (!isOk(c.domain) || c.answered < 4)) return "questions";
  // 5. consolidado mas regredindo
  if (isOk(c.domain) && c.domain.value >= MAINTENANCE_THRESHOLD && c.trendDown) return "redo";
  // 6. domínio alto → manutenção
  if (isOk(c.domain) && c.domain.value >= MAINTENANCE_THRESHOLD) return "maintenance";
  // 7. ainda há questões a fazer
  if (c.questionCount > 0) return "questions";
  // 8. prioritário mas sem nada cadastrado — nunca esconder isso
  return "await_content";
}

function hrefFor(c: RecommendationInput, action: RecommendedAction): string {
  const t = `topico=${c.topicId}`;
  switch (action) {
    case "study_theory": return `/conteudos/${c.unit?.id ?? ""}`;
    case "flashcards": return `/conteudos/${c.unit?.id ?? ""}/flashcards`;
    case "quiz": return `/conteudos/${c.unit?.id ?? ""}/quiz`;
    case "review_errors":
    case "redo": return `/estudar/sessao?${t}&modo=erradas&quantidade=10&origem=questoes`;
    case "questions": return `/estudar/sessao?${t}&modo=novas&quantidade=10&origem=questoes`;
    case "maintenance": return `/estudar/sessao?${t}&modo=todas&quantidade=10&origem=questoes`;
    case "await_content": return `/edital/${c.topicId}`;
  }
}

function score(c: RecommendationInput, weighted: boolean): number {
  return weighted ? c.priorityScore * (c.disciplineWeight / 60) : c.priorityScore;
}

/**
 * Camada de urgência — vem ANTES do score na ordenação.
 *
 * Dívida vence avanço novo: um tópico prioritário com erros pendentes é mais
 * urgente que um tópico virgem de score maior. Sem isso, o usuário acumularia
 * erros não revisados enquanto abre frentes novas.
 */
function tier(c: RecommendationInput): number {
  if (c.wrongCount > 0 && RANK[c.level] <= 2) return 0; // dívida em P1/P2
  if (c.questionCount > 0 || c.unit) return 1;          // acionável
  return 2;                                             // nada cadastrado
}

/**
 * Ordena candidatos: urgência → score → nível → menos respondidas → id.
 * O desempate final por id mantém o ranking estável entre requisições.
 */
function rank(a: RecommendationInput, b: RecommendationInput, weighted: boolean): number {
  return (
    tier(a) - tier(b) ||
    score(b, weighted) - score(a, weighted) ||
    RANK[a.level] - RANK[b.level] ||
    a.answered - b.answered ||
    a.topicId.localeCompare(b.topicId)
  );
}

export function toRecommendation(c: RecommendationInput): Recommendation {
  const action = decideAction(c);
  return {
    topicId: c.topicId,
    studyUnitId: c.unit?.id,
    title: c.topicName,
    reason: c.reasons,
    priorityScore: c.priorityScore,
    level: c.level,
    domain: c.domain,
    recommendedAction: action,
    actionLabel: ACTION_LABELS[action],
    href: hrefFor(c, action),
  };
}

export interface QueueOptions {
  /** "global" pondera pelo peso da disciplina na prova */
  scope?: "global" | "basicos" | "especificos";
  excludeTopicIds?: string[];
  limit?: number;
}

export function getStudyQueue(
  candidates: readonly RecommendationInput[],
  opts: QueueOptions = {},
): Recommendation[] {
  const { scope = "global", excludeTopicIds = [], limit } = opts;
  const excluded = new Set(excludeTopicIds);
  let pool = candidates.filter((c) => !excluded.has(c.topicId));
  if (scope === "basicos") pool = pool.filter((c) => c.disciplineWeight <= 10);
  if (scope === "especificos") pool = pool.filter((c) => c.disciplineWeight > 10);
  // `tier` já joga o não-acionável para o fim
  const out = [...pool].sort((a, b) => rank(a, b, scope === "global")).map(toRecommendation);
  return limit ? out.slice(0, limit) : out;
}

export function getNextStudyRecommendation(
  candidates: readonly RecommendationInput[],
  opts: QueueOptions = {},
): Recommendation | null {
  return getStudyQueue(candidates, { ...opts, limit: 1 })[0] ?? null;
}

export type AlertKind = "critical_low_domain" | "critical_not_started" | "errors_pending";

export interface Alert {
  kind: AlertKind;
  icon: string;
  topicId: string;
  topicName: string;
  message: string;
  level: PriorityLevel;
}

export function computeAlerts(candidates: readonly RecommendationInput[]): Alert[] {
  const out: Alert[] = [];
  for (const c of candidates) {
    if (RANK[c.level] > 1) continue; // alertas só para P1
    if (c.answered === 0 && c.questionCount > 0) {
      out.push({
        kind: "critical_not_started", icon: "⚠️", topicId: c.topicId, topicName: c.topicName,
        message: "Conteúdo prioritário ainda não estudado", level: c.level,
      });
    } else if (isOk(c.domain) && c.domain.value < LOW_DOMAIN_THRESHOLD && c.answered >= 4) {
      out.push({
        kind: "critical_low_domain", icon: "🚨", topicId: c.topicId, topicName: c.topicName,
        message: "Um dos assuntos mais importantes e seu domínio ainda está baixo", level: c.level,
      });
    }
  }
  return out;
}
