import { fromSample, type Measure } from "./measure.ts";
import { percent } from "./scoring.ts";

/**
 * Gargalo individual — o quanto ESTE usuário está frágil neste tópico (0–100).
 *
 * Não é simplesmente `100 − domínio`. Considera também erros recentes, erros
 * repetidos e cobertura (questões que sequer foram tentadas).
 */

export interface WeaknessSignals {
  answered: number;
  correct: number;
  /** tentativas mais recentes primeiro ou não — a função ordena */
  recentAttempts: { is_correct: boolean; created_at: string }[];
  /** questões erradas mais de uma vez */
  repeatedWrongCount: number;
  /** questões do tópico que o usuário nunca respondeu */
  unansweredCount: number;
  /** total de questões cadastradas no tópico */
  totalQuestions: number;
}

export interface WeaknessWeights {
  domainGap: number;
  recentErrors: number;
  repeatedErrors: number;
  coverageGap: number;
}

export const DEFAULT_WEAKNESS_WEIGHTS: WeaknessWeights = {
  domainGap: 0.4,
  recentErrors: 0.25,
  repeatedErrors: 0.2,
  coverageGap: 0.15,
};

/** Janela usada para "erros recentes". */
export const RECENT_WINDOW = 10;
/** Abaixo disso, o componente de domínio não é confiável. */
export const MIN_ANSWERED_FOR_WEAKNESS = 3;

/**
 * Fraqueza 0–100. Nunca ter respondido NÃO é fraqueza zero nem cem: vira
 * `coverageGap` alto com amostra baixa, e a confiança do score cai.
 */
export function computeWeakness(
  signals: WeaknessSignals,
  weights: WeaknessWeights = DEFAULT_WEAKNESS_WEIGHTS,
): Measure<number> {
  const { answered, correct, repeatedWrongCount, unansweredCount, totalQuestions } = signals;

  // Cobertura: quanto do tópico segue intocado. Sempre calculável.
  const coverageGap = totalQuestions > 0 ? percent(unansweredCount, totalQuestions) : 100;

  // Sem base de desempenho: a fraqueza é só cobertura, com amostra 0.
  if (answered < MIN_ANSWERED_FOR_WEAKNESS) {
    return fromSample(coverageGap, answered, MIN_ANSWERED_FOR_WEAKNESS);
  }

  const domainGap = 100 - percent(correct, answered);

  const recent = [...signals.recentAttempts]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, RECENT_WINDOW);
  const recentErrors = recent.length
    ? percent(recent.filter((r) => !r.is_correct).length, recent.length)
    : domainGap;

  const repeatedErrors = totalQuestions > 0 ? Math.min(100, percent(repeatedWrongCount, totalQuestions) * 2) : 0;

  const score =
    domainGap * weights.domainGap +
    recentErrors * weights.recentErrors +
    repeatedErrors * weights.repeatedErrors +
    coverageGap * weights.coverageGap;

  return fromSample(Math.round(Math.max(0, Math.min(100, score)) * 10) / 10, answered, MIN_ANSWERED_FOR_WEAKNESS);
}
