import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreSimulado, percent, type GradableQuestion } from "./scoring.ts";

function q(p: Partial<GradableQuestion> & { n: number }): GradableQuestion {
  return {
    question_id: `q${p.n}`,
    question_number: p.n,
    question_order: p.n,
    discipline_id: p.discipline_id ?? "d1",
    discipline_name: p.discipline_name ?? "Português",
    topic_id: p.topic_id ?? null,
    topic_name: p.topic_name ?? null,
    correct_answer: p.correct_answer ?? "A",
    selected_answer: p.selected_answer ?? null,
  };
}

test("percent arredonda para 1 casa e trata divisao por zero", () => {
  assert.equal(percent(43, 60), 71.7);
  assert.equal(percent(0, 0), 0);
  assert.equal(percent(1, 3), 33.3);
});

test("scoreSimulado conta acerto, erro e branco", () => {
  const s = scoreSimulado([
    q({ n: 1, selected_answer: "A" }),               // acerto
    q({ n: 2, selected_answer: "B" }),               // erro
    q({ n: 3 }),                                      // branco
  ]);
  assert.equal(s.total, 3);
  assert.equal(s.correct, 1);
  assert.equal(s.wrong, 1);
  assert.equal(s.blank, 1);
  assert.equal(s.answered, 2);
  assert.equal(s.percentage, 33.3);
});

test("questoes em branco entram na lista de erradas", () => {
  const s = scoreSimulado([q({ n: 1, selected_answer: "B" }), q({ n: 2 })]);
  assert.deepEqual(s.wrongQuestions.map((w) => w.question_number), [1, 2]);
});

test("quebra por disciplina soma corretamente", () => {
  const s = scoreSimulado([
    q({ n: 1, selected_answer: "A" }),
    q({ n: 2, selected_answer: "A" }),
    q({ n: 3, discipline_id: "d2", discipline_name: "Matemática", selected_answer: "C" }),
  ]);
  const port = s.byDiscipline.find((d) => d.discipline_id === "d1")!;
  const mat = s.byDiscipline.find((d) => d.discipline_id === "d2")!;
  assert.equal(port.correct, 2);
  assert.equal(port.percentage, 100);
  assert.equal(mat.correct, 0);
  assert.equal(mat.percentage, 0);
});

test("simulado vazio nao quebra", () => {
  const s = scoreSimulado([]);
  assert.equal(s.percentage, 0);
  assert.deepEqual(s.byDiscipline, []);
});

test("cenario do briefing: 43/60 = 71,7%", () => {
  const questions = Array.from({ length: 60 }, (_, i) =>
    q({ n: i + 1, selected_answer: i < 43 ? "A" : "B" }),
  );
  assert.equal(scoreSimulado(questions).percentage, 71.7);
});
