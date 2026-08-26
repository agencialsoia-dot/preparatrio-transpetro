import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSample, insufficient, isOk, mapMeasure, ok, unwrapOr, valueOrNull } from "./measure.ts";

test("fromSample vira ok só ao atingir o mínimo", () => {
  assert.equal(fromSample(80, 10, 10).kind, "ok");
  assert.equal(fromSample(80, 9, 10).kind, "insufficient");
});
test("insufficient carrega amostra e mínimo para a UI explicar", () => {
  const m = insufficient<number>(3, 10);
  assert.deepEqual(m, { kind: "insufficient", sample: 3, minimum: 10 });
});
test("mapMeasure preserva insufficient sem chamar a função", () => {
  let chamou = false;
  const m = mapMeasure(insufficient<number>(0, 5), () => { chamou = true; return 1; });
  assert.equal(m.kind, "insufficient");
  assert.equal(chamou, false);
});
test("unwrapOr e valueOrNull tratam o caso vazio", () => {
  assert.equal(unwrapOr(insufficient<number>(0, 5), -1), -1);
  assert.equal(unwrapOr(ok(42, 9), -1), 42);
  assert.equal(valueOrNull(insufficient<number>(0, 5)), null);
  assert.equal(valueOrNull(ok(42, 9)), 42);
});
test("isOk estreita o tipo", () => {
  const m = ok(7, 1);
  assert.ok(isOk(m) && m.value === 7);
});
