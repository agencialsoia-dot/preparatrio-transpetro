import { isOk, type Measure } from "./measure.ts";

/**
 * Motor de prioridade de estudo.
 *
 * Responde "o que vale mais estudar agora", cruzando o que a prova cobra com o
 * que o usuário ainda não domina. O cálculo mora AQUI e em nenhum componente.
 */

export type PriorityLevel = "P1" | "P2" | "P3" | "P4";

export interface PriorityInfo {
  key: PriorityLevel;
  label: string;
  /** ícone + label sempre juntos — cor nunca carrega a informação sozinha */
  icon: string;
  tone: "err" | "warn" | "info" | "muted";
  rank: number;
}

export const PRIORITY_MAP: Record<PriorityLevel, PriorityInfo> = {
  P1: { key: "P1", label: "Prioridade máxima", icon: "🔥", tone: "err", rank: 1 },
  P2: { key: "P2", label: "Prioridade alta", icon: "🟠", tone: "warn", rank: 2 },
  P3: { key: "P3", label: "Prioridade média", icon: "🟡", tone: "info", rank: 3 },
  P4: { key: "P4", label: "Cobertura", icon: "⚪", tone: "muted", rank: 4 },
};

export const PRIORITY_LEVELS: PriorityLevel[] = ["P1", "P2", "P3", "P4"];

export interface PriorityWeights {
  historical: number;
  edital: number;
  career: number;
  difficulty: number;
  weakness: number;
}

/** Pesos padrão — configuráveis. Devem somar 1. */
export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  historical: 0.25,
  edital: 0.25,
  career: 0.2,
  difficulty: 0.1,
  weakness: 0.2,
};

export type PriorityComponent = keyof PriorityWeights;

export interface PriorityInputs {
  /** incidência histórica 0–100 (hoje quase sempre insuficiente: 1 prova) */
  historicalFrequency: Measure<number>;
  /** aderência ao edital 0–100 */
  editalRelevance: number | null;
  /** relevância para a vaga 0–100 */
  careerRelevance: number | null;
  /** 1–5, normalizado para 0–100 */
  difficultyLevel: number | null;
  /** gargalo individual 0–100 */
  weakness: Measure<number>;
}

export type Confidence = "high" | "medium" | "low";

export interface PriorityScore {
  score: number;
  confidence: Confidence;
  usedWeights: PriorityWeights;
  missing: PriorityComponent[];
  breakdown: Record<PriorityComponent, number | null>;
}

/** Renormaliza para somar 1, ignorando componentes ausentes. */
export function normalizeWeights(
  base: PriorityWeights,
  present: PriorityComponent[],
): PriorityWeights {
  const total = present.reduce((sum, k) => sum + base[k], 0);
  const out = { historical: 0, edital: 0, career: 0, difficulty: 0, weakness: 0 } as PriorityWeights;
  if (total <= 0) return out;
  for (const k of present) out[k] = base[k] / total;
  return out;
}

function measureValue(m: Measure<number>): number | null {
  return isOk(m) ? m.value : null;
}

/**
 * Score 0–100.
 *
 * DECISÃO CENTRAL: componente ausente **não entra como zero** — seu peso é
 * redistribuído entre os presentes. Tratar ausência como zero rebaixaria todo
 * tópico P1 que ainda não tem histórico, que é exatamente o cenário atual
 * (uma única prova na base). Em vez disso, a `confidence` cai e a UI avisa.
 */
export function computePriorityScore(
  inputs: PriorityInputs,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): PriorityScore {
  const breakdown: Record<PriorityComponent, number | null> = {
    historical: measureValue(inputs.historicalFrequency),
    edital: inputs.editalRelevance,
    career: inputs.careerRelevance,
    difficulty: inputs.difficultyLevel == null ? null : (inputs.difficultyLevel / 5) * 100,
    weakness: measureValue(inputs.weakness),
  };

  const present = (Object.keys(breakdown) as PriorityComponent[]).filter((k) => breakdown[k] != null);
  const missing = (Object.keys(breakdown) as PriorityComponent[]).filter((k) => breakdown[k] == null);
  const usedWeights = normalizeWeights(weights, present);

  const score = present.reduce((sum, k) => sum + (breakdown[k] as number) * usedWeights[k], 0);
  const confidence: Confidence = missing.length === 0 ? "high" : missing.length === 1 ? "medium" : "low";

  return {
    score: Math.round(Math.max(0, Math.min(100, score)) * 10) / 10,
    confidence,
    usedWeights,
    missing,
    breakdown,
  };
}

/** Faixas para derivar um nível a partir do score calculado. */
export function scoreToLevel(score: number): PriorityLevel {
  if (score >= 75) return "P1";
  if (score >= 55) return "P2";
  if (score >= 35) return "P3";
  return "P4";
}

export interface ResolvedPriority {
  level: PriorityLevel;
  source: "manual" | "computed";
  /** true quando a curadoria diverge do que o cálculo sugere */
  diverged: boolean;
  computedLevel: PriorityLevel;
}

/**
 * A curadoria humana VENCE o cálculo. A automação nunca sobrescreve em silêncio —
 * apenas sinaliza a divergência, que aparece no admin.
 */
export function resolvePriority(
  stored: PriorityLevel | null,
  computed: PriorityScore,
): ResolvedPriority {
  const computedLevel = scoreToLevel(computed.score);
  if (stored) {
    return { level: stored, source: "manual", diverged: stored !== computedLevel, computedLevel };
  }
  return { level: computedLevel, source: "computed", diverged: false, computedLevel };
}

/** Frases prontas explicando por que o tópico é prioritário (§22). */
export function explainPriority(
  inputs: PriorityInputs,
  score: PriorityScore,
  level: PriorityLevel,
): string[] {
  const reasons: string[] = [];
  if (level === "P1") reasons.push("Prioridade máxima no seu edital");
  else if (level === "P2") reasons.push("Alta prioridade no seu edital");

  if (isOk(inputs.historicalFrequency) && inputs.historicalFrequency.value >= 8) {
    reasons.push("Alta incidência em provas anteriores");
  }
  if ((inputs.editalRelevance ?? 0) >= 80) reasons.push("Forte aderência ao conteúdo do edital");
  if ((inputs.careerRelevance ?? 0) >= 80) reasons.push("Muito ligado à atividade de Dutos e Terminais");
  if (isOk(inputs.weakness) && inputs.weakness.value >= 50) {
    reasons.push("Seu domínio ainda está abaixo do necessário");
  }
  if ((inputs.difficultyLevel ?? 0) >= 4) reasons.push("Assunto historicamente difícil");

  if (score.confidence === "low") {
    reasons.push("Prioridade estimada com dados parciais");
  }
  return reasons;
}
