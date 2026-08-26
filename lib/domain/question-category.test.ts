import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES } from "./question-category.ts";

test("prova real tem rótulo destacado", () => {
  assert.equal(CATEGORIES.prova_real.short, "PROVA REAL");
  assert.equal(CATEGORIES.questao_inedita.label, "Questão inédita");
});
