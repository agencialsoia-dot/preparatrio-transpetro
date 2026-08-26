import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStatus, trailProgress } from "./status.ts";

test("0 respondidas → não iniciado", () => {
  assert.equal(computeStatus(0, 0).key, "nao_iniciado");
});
test("iniciado mas abaixo do mínimo → em estudo", () => {
  assert.equal(computeStatus(2, 100).key, "em_estudo");
});
test("faixas de desempenho", () => {
  assert.equal(computeStatus(10, 40).key, "precisa_revisar");
  assert.equal(computeStatus(10, 60).key, "em_desenvolvimento");
  assert.equal(computeStatus(10, 80).key, "em_desenvolvimento");
  assert.equal(computeStatus(10, 90).key, "consolidado");
});
test("trailProgress limita 0–100", () => {
  assert.equal(trailProgress(0, 7), 0);
  assert.equal(trailProgress(7, 7), 100);
  assert.equal(trailProgress(3, 7), 43);
  assert.equal(trailProgress(1, 0), 0);
});
