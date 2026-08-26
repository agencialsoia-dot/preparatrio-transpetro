import { test } from "node:test";
import assert from "node:assert/strict";
import { insufficient, ok } from "./measure.ts";
import {
  computePriorityScore, DEFAULT_PRIORITY_WEIGHTS, explainPriority, normalizeWeights,
  resolvePriority, scoreToLevel, type PriorityInputs,
} from "./priority.ts";

const full: PriorityInputs = {
  historicalFrequency: ok(90, 40),
  editalRelevance: 100,
  careerRelevance: 100,
  difficultyLevel: 4,      // → 80
  weakness: ok(45, 20),
};

test("pesos padrão somam 1", () => {
  const s = Object.values(DEFAULT_PRIORITY_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(s - 1) < 1e-9);
});

test("todos presentes → média ponderada exata", () => {
  const r = computePriorityScore(full);
  // 90*.25 + 100*.25 + 100*.20 + 80*.10 + 45*.20 = 22.5+25+20+8+9 = 84.5
  assert.equal(r.score, 84.5);
  assert.equal(r.confidence, "high");
  assert.deepEqual(r.missing, []);
});

test("componente ausente NÃO entra como zero — peso é redistribuído", () => {
  const semHistorico = { ...full, historicalFrequency: insufficient<number>(60, 20) };
  const r = computePriorityScore(semHistorico);
  // sem historical: pesos renormalizados sobre 0.75 → score dos presentes
  // (100*.25 + 100*.20 + 80*.10 + 45*.20)/0.75 = (25+20+8+9)/0.75 = 82.67
  assert.equal(r.score, 82.7);
  assert.equal(r.confidence, "medium");
  assert.deepEqual(r.missing, ["historical"]);
  // o ponto crucial: não despencou como aconteceria com zero (que daria 62)
  assert.ok(r.score > 75, "tópico P1 sem histórico não pode ser rebaixado");
});

test("dois ausentes → confiança baixa", () => {
  const r = computePriorityScore({
    ...full,
    historicalFrequency: insufficient<number>(0, 20),
    weakness: insufficient<number>(0, 3),
  });
  assert.equal(r.confidence, "low");
  assert.equal(r.missing.length, 2);
});

test("cenário real de hoje: sem histórico e sem tentativas", () => {
  const r = computePriorityScore({
    historicalFrequency: insufficient<number>(60, 20),
    editalRelevance: 95,
    careerRelevance: 90,
    difficultyLevel: 4,
    weakness: insufficient<number>(0, 3),
  });
  assert.equal(r.confidence, "low");
  assert.ok(r.score > 0 && r.score <= 100);
  assert.equal(r.breakdown.historical, null);
  assert.equal(r.breakdown.weakness, null);
});

test("normalizeWeights redistribui proporcionalmente", () => {
  const w = normalizeWeights(DEFAULT_PRIORITY_WEIGHTS, ["edital", "career"]);
  assert.ok(Math.abs(w.edital + w.career - 1) < 1e-9);
  assert.ok(w.edital > w.career); // .25 vs .20 mantém a proporção
  assert.equal(w.historical, 0);
});

test("nenhum componente presente não quebra", () => {
  const r = computePriorityScore({
    historicalFrequency: insufficient<number>(0, 20),
    editalRelevance: null, careerRelevance: null, difficultyLevel: null,
    weakness: insufficient<number>(0, 3),
  });
  assert.equal(r.score, 0);
  assert.equal(r.confidence, "low");
});

test("fronteiras de scoreToLevel", () => {
  assert.equal(scoreToLevel(75), "P1");
  assert.equal(scoreToLevel(74.9), "P2");
  assert.equal(scoreToLevel(55), "P2");
  assert.equal(scoreToLevel(54.9), "P3");
  assert.equal(scoreToLevel(35), "P3");
  assert.equal(scoreToLevel(34.9), "P4");
});

test("curadoria manual vence o computado e sinaliza divergência", () => {
  const computed = computePriorityScore({
    ...full, editalRelevance: 30, careerRelevance: 30, difficultyLevel: 1,
    historicalFrequency: ok(5, 40), weakness: ok(10, 20),
  });
  const r = resolvePriority("P1", computed);
  assert.equal(r.level, "P1");
  assert.equal(r.source, "manual");
  assert.equal(r.diverged, true);
  assert.notEqual(r.computedLevel, "P1");
});

test("sem curadoria usa o computado, sem divergência", () => {
  const r = resolvePriority(null, computePriorityScore(full));
  assert.equal(r.source, "computed");
  assert.equal(r.diverged, false);
});

test("explicação nunca vem vazia e avisa quando os dados são parciais", () => {
  const score = computePriorityScore({
    ...full, historicalFrequency: insufficient<number>(0, 20), weakness: insufficient<number>(0, 3),
  });
  const r = explainPriority(
    { ...full, historicalFrequency: insufficient<number>(0, 20), weakness: insufficient<number>(0, 3) },
    score, "P1",
  );
  assert.ok(r.length > 0);
  assert.ok(r.some((x) => x.includes("dados parciais")));
});
