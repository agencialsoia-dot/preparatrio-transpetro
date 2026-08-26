import type { AttemptRow } from "./stats.ts";
import { fromSample, isOk, type Measure } from "./measure.ts";
import { percent } from "./scoring.ts";

/** Janelas de desempenho recente (§43). */
export const TREND_WINDOWS = [10, 20, 50] as const;
export type TrendWindow = (typeof TREND_WINDOWS)[number];

export interface TrendPoint {
  window: number;
  accuracy: Measure<number>;
}

export type TrendDirection = "up" | "down" | "stable" | "unknown";

export interface Trend {
  points: TrendPoint[];
  direction: TrendDirection;
  /** diferença (janela curta − janela longa) em pontos percentuais; null se indeterminado */
  delta: number | null;
}

/** Ordena por data desc — não confia na ordem de entrada. */
function newestFirst(rows: readonly AttemptRow[]): AttemptRow[] {
  return [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Acerto nas últimas `window` tentativas. Exige a janela COMPLETA:
 * "últimas 50" com 25 respostas não é 50 — é dado insuficiente.
 */
export function recentAccuracy(rows: readonly AttemptRow[], window: number): Measure<number> {
  const slice = newestFirst(rows).slice(0, window);
  const correct = slice.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
  return fromSample(percent(correct, slice.length), slice.length, window);
}

/** Considera mudança relevante a partir de 5 pontos percentuais. */
export const TREND_STABLE_BAND = 5;

export function computeTrend(rows: readonly AttemptRow[]): Trend {
  const points: TrendPoint[] = TREND_WINDOWS.map((w) => ({
    window: w,
    accuracy: recentAccuracy(rows, w),
  }));

  const short = points[0].accuracy;
  const longer = points.find((p) => p.window > 10 && isOk(p.accuracy))?.accuracy;

  if (!isOk(short) || !longer || !isOk(longer)) {
    return { points, direction: "unknown", delta: null };
  }
  const delta = Math.round((short.value - longer.value) * 10) / 10;
  const direction: TrendDirection =
    delta > TREND_STABLE_BAND ? "up" : delta < -TREND_STABLE_BAND ? "down" : "stable";
  return { points, direction, delta };
}

/** Janela recente compacta para `computeStatusWithRecency`. */
export function recentWindow(rows: readonly AttemptRow[], window = 5) {
  const slice = newestFirst(rows).slice(0, window);
  return {
    total: slice.length,
    wrong: slice.reduce((n, r) => n + (r.is_correct ? 0 : 1), 0),
    lastAt: slice[0]?.created_at ?? null,
  };
}
