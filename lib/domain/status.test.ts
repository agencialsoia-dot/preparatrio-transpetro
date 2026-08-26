import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStatus, computeStatusWithRecency, trailProgress } from "./status.ts";

test("0 respondidas → não iniciado", () => {
  assert.equal(computeStatus(0, 0).key, "nao_iniciado");
});

test("iniciado mas abaixo do mínimo → em estudo (2 acertos não consolidam ninguém)", () => {
  assert.equal(computeStatus(2, 100).key, "em_estudo");
});

test("faixas de desempenho — cada uma distinta (regressão do branch morto)", () => {
  assert.equal(computeStatus(10, 40).key, "precisa_revisar");     // <50
  assert.equal(computeStatus(10, 60).key, "em_desenvolvimento");  // 50-69
  assert.equal(computeStatus(10, 80).key, "bom");                 // 70-84
  assert.equal(computeStatus(10, 90).key, "consolidado");         // >=85
});

test("fronteiras exatas das faixas", () => {
  assert.equal(computeStatus(10, 49.9).key, "precisa_revisar");
  assert.equal(computeStatus(10, 50).key, "em_desenvolvimento");
  assert.equal(computeStatus(10, 69.9).key, "em_desenvolvimento");
  assert.equal(computeStatus(10, 70).key, "bom");
  assert.equal(computeStatus(10, 84.9).key, "bom");
  assert.equal(computeStatus(10, 85).key, "consolidado");
});

test("recência rebaixa consolidado que está errando agora", () => {
  // domínio 90% mas 3 das últimas 5 erradas → não é consolidado
  const s = computeStatusWithRecency(20, 90, { total: 5, wrong: 3, lastAt: "2026-08-26" });
  assert.equal(s.key, "precisa_revisar");
});

test("recência NUNCA promove — só rebaixa", () => {
  const s = computeStatusWithRecency(20, 30, { total: 5, wrong: 0, lastAt: "2026-08-26" });
  assert.equal(s.key, "precisa_revisar"); // continua no que o domínio diz
});

test("janela recente pequena demais não rebaixa nada", () => {
  const s = computeStatusWithRecency(20, 90, { total: 4, wrong: 4, lastAt: "2026-08-26" });
  assert.equal(s.key, "consolidado");
});

test("trailProgress limita 0–100 e trata denominador zero", () => {
  assert.equal(trailProgress(0, 7), 0);
  assert.equal(trailProgress(7, 7), 100);
  assert.equal(trailProgress(3, 7), 43);
  assert.equal(trailProgress(1, 0), 0);
});
