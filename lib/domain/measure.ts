/**
 * Measure<T> — o tipo da honestidade estatística.
 *
 * Todo cálculo derivado de base rala devolve um Measure. O type-check OBRIGA
 * a tratar o caso vazio, então é impossível renderizar um número inventado:
 * ou existe amostra suficiente (`ok`) ou a UI mostra "Dados insuficientes".
 */

export type Measure<T> =
  | { kind: "ok"; value: T; sample: number }
  | { kind: "insufficient"; sample: number; minimum: number };

export function ok<T>(value: T, sample: number): Measure<T> {
  return { kind: "ok", value, sample };
}

export function insufficient<T>(sample: number, minimum: number): Measure<T> {
  return { kind: "insufficient", sample, minimum };
}

export function isOk<T>(m: Measure<T>): m is { kind: "ok"; value: T; sample: number } {
  return m.kind === "ok";
}

/** Cria um Measure a partir de uma amostra: `ok` se atingiu o mínimo. */
export function fromSample<T>(value: T, sample: number, minimum: number): Measure<T> {
  return sample >= minimum ? ok(value, sample) : insufficient(sample, minimum);
}

export function mapMeasure<A, B>(m: Measure<A>, fn: (a: A) => B): Measure<B> {
  return m.kind === "ok" ? ok(fn(m.value), m.sample) : m;
}

export function unwrapOr<T>(m: Measure<T>, fallback: T): T {
  return m.kind === "ok" ? m.value : fallback;
}

/** Valor numérico ou null — atalho para alimentar o motor de prioridade. */
export function valueOrNull(m: Measure<number>): number | null {
  return m.kind === "ok" ? m.value : null;
}
