import { test } from "node:test";
import assert from "node:assert/strict";
import { ERROR_TYPES, ERROR_TYPE_MAP, isErrorType } from "./errors.ts";

test("6 tipos de erro com recomendação mapeada", () => {
  assert.equal(ERROR_TYPES.length, 6);
  assert.equal(ERROR_TYPE_MAP.nao_sabia.recommends, "fundamentals");
  assert.equal(ERROR_TYPE_MAP.erro_calculo.recommends, "formula");
  assert.equal(ERROR_TYPE_MAP.chute.recommends, null);
});
test("isErrorType valida", () => {
  assert.ok(isErrorType("chute"));
  assert.ok(!isErrorType("qualquer"));
});
