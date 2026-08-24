import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStudyFilter, selectQuestionIds } from "./filters.ts";

const ids = ["q1", "q2", "q3", "q4"];
const history = {
  answeredIds: new Set(["q1", "q2"]),
  wrongIds: new Set(["q2"]),
};

test("modo 'novas' exclui tudo que ja foi respondido", () => {
  assert.deepEqual(selectQuestionIds(ids, history, "novas", 10), ["q3", "q4"]);
});

test("modo 'erradas' devolve so os erros", () => {
  assert.deepEqual(selectQuestionIds(ids, history, "erradas", 10), ["q2"]);
});

test("modo 'respondidas' devolve so o que ja foi visto", () => {
  assert.deepEqual(selectQuestionIds(ids, history, "respondidas", 10), ["q1", "q2"]);
});

test("modo 'todas' nao filtra", () => {
  assert.deepEqual(selectQuestionIds(ids, history, "todas", 10), ids);
});

test("respeita a quantidade escolhida", () => {
  assert.equal(selectQuestionIds(ids, history, "todas", 2).length, 2);
});

test("parseStudyFilter cai em padroes seguros com entrada invalida", () => {
  const f = parseStudyFilter({ modo: "hackeado", quantidade: "999" });
  assert.equal(f.mode, "todas");
  assert.equal(f.size, 10);
  assert.equal(f.disciplineId, null);
});

test("parseStudyFilter aceita valores validos", () => {
  const f = parseStudyFilter({ disciplina: "d1", modo: "erradas", quantidade: "30" });
  assert.equal(f.mode, "erradas");
  assert.equal(f.size, 30);
  assert.equal(f.disciplineId, "d1");
});
