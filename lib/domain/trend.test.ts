import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTrend, recentAccuracy, recentWindow } from "./trend.ts";
import type { AttemptRow } from "./stats.ts";

function rows(spec: boolean[], startDay = 1): AttemptRow[] {
  // índice 0 = mais antigo; a função deve reordenar sozinha
  return spec.map((ok, i) => ({
    question_id: `q${i}`,
    is_correct: ok,
    created_at: `2026-08-${String(startDay + i).padStart(2, "0")}T10:00:00Z`,
    discipline_id: "d1",
    discipline_name: "Disciplina",
    topic_id: "t1",
    topic_name: "Tópico",
  }));
}

test("janela incompleta → insuficiente (25 respostas não são 'as últimas 50')", () => {
  const r = rows(Array(25).fill(true));
  assert.equal(recentAccuracy(r, 10).kind, "ok");
  assert.equal(recentAccuracy(r, 20).kind, "ok");
  assert.equal(recentAccuracy(r, 50).kind, "insufficient");
});

test("9 tentativas → todas as janelas insuficientes e direção desconhecida", () => {
  const t = computeTrend(rows(Array(9).fill(true)));
  assert.ok(t.points.every((p) => p.accuracy.kind === "insufficient"));
  assert.equal(t.direction, "unknown");
  assert.equal(t.delta, null);
});

test("reordena por data — entrada fora de ordem não engana", () => {
  const r = rows([...Array(10).fill(false), ...Array(10).fill(true)]); // recentes = true
  const desordenado = [r[15], r[0], r[19], ...r];
  const acc = recentAccuracy(desordenado, 10);
  assert.equal(acc.kind, "ok");
  if (acc.kind === "ok") assert.equal(acc.value, 100); // as 10 mais recentes são acertos
});

test("melhora recente → direção 'up'", () => {
  // 10 antigas erradas + 10 recentes certas: últimas 10 = 100%, últimas 20 = 50%
  const t = computeTrend(rows([...Array(10).fill(false), ...Array(10).fill(true)]));
  assert.equal(t.direction, "up");
  assert.equal(t.delta, 50);
});

test("piora recente → direção 'down'", () => {
  const t = computeTrend(rows([...Array(10).fill(true), ...Array(10).fill(false)]));
  assert.equal(t.direction, "down");
});

test("variação pequena → 'stable'", () => {
  const t = computeTrend(rows(Array(20).fill(true)));
  assert.equal(t.direction, "stable");
  assert.equal(t.delta, 0);
});

test("recentWindow conta erros das últimas N", () => {
  const w = recentWindow(rows([true, true, false, false, false]), 5);
  assert.equal(w.total, 5);
  assert.equal(w.wrong, 3);
});

test("lista vazia não quebra", () => {
  const t = computeTrend([]);
  assert.equal(t.direction, "unknown");
  assert.equal(recentWindow([]).total, 0);
});
