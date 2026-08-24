import { test } from "node:test";
import assert from "node:assert/strict";
import { seededShuffle } from "./shuffle.ts";

const items = Array.from({ length: 60 }, (_, i) => i + 1);

test("mesma seed produz sempre a mesma ordem", () => {
  assert.deepEqual(seededShuffle(items, "abc"), seededShuffle(items, "abc"));
});

test("seeds diferentes produzem ordens diferentes", () => {
  assert.notDeepEqual(seededShuffle(items, "abc"), seededShuffle(items, "xyz"));
});

test("preserva todos os elementos, sem perder nem duplicar", () => {
  const out = seededShuffle(items, "seed");
  assert.equal(out.length, items.length);
  assert.deepEqual([...out].sort((a, b) => a - b), items);
});

test("nao modifica o array original", () => {
  const original = [...items];
  seededShuffle(items, "seed");
  assert.deepEqual(items, original);
});
