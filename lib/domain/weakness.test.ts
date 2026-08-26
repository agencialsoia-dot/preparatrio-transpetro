import { test } from "node:test";
import assert from "node:assert/strict";
import { computeWeakness, type WeaknessSignals } from "./weakness.ts";
import { isOk } from "./measure.ts";

const base: WeaknessSignals = {
  answered: 0, correct: 0, recentAttempts: [],
  repeatedWrongCount: 0, unansweredCount: 0, totalQuestions: 10,
};

test("nunca respondeu → não é fraqueza 0 nem 100: é cobertura, com amostra baixa", () => {
  const w = computeWeakness({ ...base, unansweredCount: 10 });
  assert.equal(w.kind, "insufficient"); // amostra 0 < mínimo
  assert.equal(w.sample, 0);
});

test("domínio perfeito e cobertura total → fraqueza próxima de zero", () => {
  const w = computeWeakness({
    ...base, answered: 10, correct: 10, unansweredCount: 0,
    recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: true, created_at: `2026-08-${10 + i}` })),
  });
  assert.ok(isOk(w) && w.value < 5);
});

test("domínio baixo → fraqueza alta", () => {
  // 20% de acerto, cobertura total, sem repetições:
  // domainGap 80*.40 + recentes 80*.25 + repetidos 0 + cobertura 0 = 52
  const w = computeWeakness({
    ...base, answered: 10, correct: 2, unansweredCount: 0,
    recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: i < 2, created_at: `2026-08-${10 + i}` })),
  });
  assert.ok(isOk(w) && w.value === 52);
});

test("é monotônica no domínio — é isso que sustenta o ranking", () => {
  const at = (correct: number) => {
    const w = computeWeakness({
      ...base, answered: 10, correct, unansweredCount: 0,
      recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: i < correct, created_at: `2026-08-${10 + i}` })),
    });
    return isOk(w) ? w.value : NaN;
  };
  const serie = [10, 8, 5, 2, 0].map(at);
  for (let i = 1; i < serie.length; i++) {
    assert.ok(serie[i] > serie[i - 1], `pior domínio deve dar mais fraqueza: ${serie}`);
  }
});

test("cobertura incompleta aumenta a fraqueza em relação à cobertura total", () => {
  const comum = { ...base, answered: 10, correct: 5, totalQuestions: 20,
    recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: i < 5, created_at: `2026-08-${10 + i}` })) };
  const coberto = computeWeakness({ ...comum, unansweredCount: 0 });
  const parcial = computeWeakness({ ...comum, unansweredCount: 10 });
  assert.ok(isOk(coberto) && isOk(parcial));
  if (isOk(coberto) && isOk(parcial)) assert.ok(parcial.value > coberto.value);
});

test("erros repetidos elevam a fraqueza mesmo com domínio razoável", () => {
  const semRepetidos = computeWeakness({
    ...base, answered: 10, correct: 8, unansweredCount: 0, repeatedWrongCount: 0,
    recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: i < 8, created_at: `2026-08-${10 + i}` })),
  });
  const comRepetidos = computeWeakness({
    ...base, answered: 10, correct: 8, unansweredCount: 0, repeatedWrongCount: 4,
    recentAttempts: Array.from({ length: 10 }, (_, i) => ({ is_correct: i < 8, created_at: `2026-08-${10 + i}` })),
  });
  assert.ok(isOk(semRepetidos) && isOk(comRepetidos));
  if (isOk(semRepetidos) && isOk(comRepetidos)) assert.ok(comRepetidos.value > semRepetidos.value);
});

test("janela recente vazia não quebra — cai no domínio", () => {
  const w = computeWeakness({ ...base, answered: 5, correct: 3, unansweredCount: 5, recentAttempts: [] });
  assert.ok(isOk(w));
});

test("tópico sem questões cadastradas não divide por zero", () => {
  const w = computeWeakness({ ...base, totalQuestions: 0, unansweredCount: 0 });
  assert.equal(w.kind, "insufficient");
});
