import { test } from "node:test";
import assert from "node:assert/strict";
import { describeBase, questionCountByTopic, weightedIncidenceByTopic, type ExamSource, type QuestionRef } from "./incidence.ts";

const exam = (id: string, w: number, ref = true): ExamSource =>
  ({ exam_id: id, position: null, source_weight: w, is_reference: ref });
const qs = (examId: string, topic: string, n: number): QuestionRef[] =>
  Array.from({ length: n }, (_, i) => ({ question_id: `${examId}-${topic}-${i}`, exam_id: examId, topic_id: topic }));

test("UMA prova só → tudo insuficiente (cenário atual do projeto)", () => {
  const questions = [...qs("e1", "t1", 40), ...qs("e1", "t2", 20)];
  const r = weightedIncidenceByTopic(questions, [exam("e1", 1)]);
  assert.equal(r.get("t1")!.kind, "insufficient");
  assert.equal(r.get("t2")!.kind, "insufficient");
});

test("duas provas com pesos diferentes → proporção ponderada", () => {
  // e1 peso 1.0: 30 questões de t1; e2 peso 0.5: 30 questões de t2
  const questions = [...qs("e1", "t1", 30), ...qs("e2", "t2", 30)];
  const r = weightedIncidenceByTopic(questions, [exam("e1", 1), exam("e2", 0.5)]);
  const t1 = r.get("t1")!, t2 = r.get("t2")!;
  assert.equal(t1.kind, "ok");
  assert.equal(t2.kind, "ok");
  if (t1.kind === "ok" && t2.kind === "ok") {
    // 30 vs 15 de peso → 66.7% e 33.3%
    assert.equal(t1.value, 66.7);
    assert.equal(t2.value, 33.3);
    assert.ok(Math.abs(t1.value + t2.value - 100) < 0.2);
  }
});

test("exame não-referência (amostra) fica fora da estatística", () => {
  const questions = [...qs("e1", "t1", 30), ...qs("e2", "t2", 30), ...qs("demo", "t3", 100)];
  const r = weightedIncidenceByTopic(questions, [exam("e1", 1), exam("e2", 1), exam("demo", 1, false)]);
  assert.equal(r.has("t3"), false);
});

test("questão sem tópico ou sem prova é ignorada sem quebrar", () => {
  const questions: QuestionRef[] = [
    ...qs("e1", "t1", 25), ...qs("e2", "t2", 25),
    { question_id: "x", exam_id: "e1", topic_id: null },
    { question_id: "y", exam_id: null, topic_id: "t1" },
  ];
  const r = weightedIncidenceByTopic(questions, [exam("e1", 1), exam("e2", 1)]);
  assert.equal(r.get("t1")!.kind, "ok");
});

test("describeBase relata quantas provas sustentam a estatística", () => {
  const b = describeBase([...qs("e1", "t1", 60)], [exam("e1", 1)]);
  assert.deepEqual({ exams: b.exams, questions: b.questions, sufficient: b.sufficient },
    { exams: 1, questions: 60, sufficient: false }); // 60 questões, mas 1 prova
});

test("contagem bruta funciona mesmo sem base estatística", () => {
  const c = questionCountByTopic([...qs("e1", "t1", 3), ...qs("e1", "t2", 1)]);
  assert.equal(c.get("t1"), 3);
  assert.equal(c.get("t2"), 1);
});
