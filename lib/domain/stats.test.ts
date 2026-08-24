import { test } from "node:test";
import assert from "node:assert/strict";
import { overallStats, statsByDiscipline, statsByTopic, dailySeries, type AttemptRow } from "./stats.ts";

function row(p: Partial<AttemptRow>): AttemptRow {
  return {
    question_id: p.question_id ?? "q1",
    is_correct: p.is_correct ?? true,
    created_at: p.created_at ?? "2026-08-24T10:00:00Z",
    discipline_id: p.discipline_id ?? "d1",
    discipline_name: p.discipline_name ?? "Português",
    topic_id: p.topic_id ?? null,
    topic_name: p.topic_name ?? null,
  };
}

test("overallStats conta tentativas e questoes distintas", () => {
  const s = overallStats([
    row({ question_id: "q1", is_correct: true }),
    row({ question_id: "q1", is_correct: false }),
    row({ question_id: "q2", is_correct: true }),
  ]);
  assert.equal(s.answered, 3);
  assert.equal(s.correct, 2);
  assert.equal(s.wrong, 1);
  assert.equal(s.uniqueQuestions, 2);
  assert.equal(s.percentage, 66.7);
});

test("overallStats sem tentativas devolve zeros", () => {
  assert.deepEqual(overallStats([]), {
    answered: 0, correct: 0, wrong: 0, percentage: 0, uniqueQuestions: 0,
  });
});

test("statsByDiscipline ordena do pior para o melhor", () => {
  const s = statsByDiscipline([
    row({ discipline_id: "d1", discipline_name: "Português", is_correct: true }),
    row({ discipline_id: "d2", discipline_name: "Matemática", is_correct: false }),
  ]);
  assert.equal(s[0].name, "Matemática");
  assert.equal(s[0].percentage, 0);
  assert.equal(s[1].percentage, 100);
});

test("statsByTopic ignora tentativas sem topico cadastrado", () => {
  const s = statsByTopic([
    row({ topic_id: null }),
    row({ topic_id: "t1", topic_name: "Termodinâmica", is_correct: false }),
  ]);
  assert.equal(s.length, 1);
  assert.equal(s[0].name, "Termodinâmica");
});

test("dailySeries agrupa por dia em ordem cronologica", () => {
  const s = dailySeries([
    row({ created_at: "2026-08-24T10:00:00Z", is_correct: true }),
    row({ created_at: "2026-08-22T10:00:00Z", is_correct: false }),
    row({ created_at: "2026-08-22T18:00:00Z", is_correct: true }),
  ]);
  assert.deepEqual(s.map((p) => p.date), ["2026-08-22", "2026-08-24"]);
  assert.equal(s[0].answered, 2);
  assert.equal(s[0].percentage, 50);
});
