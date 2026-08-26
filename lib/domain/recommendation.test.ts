import { test } from "node:test";
import assert from "node:assert/strict";
import { insufficient, ok } from "./measure.ts";
import {
  computeAlerts, getNextStudyRecommendation, getStudyQueue, type RecommendationInput,
} from "./recommendation.ts";

const c = (p: Partial<RecommendationInput> & { topicId: string }): RecommendationInput => ({
  topicName: `Tópico ${p.topicId}`, disciplineName: "Conhecimentos Específicos",
  disciplineWeight: 40, level: "P1", priorityScore: 80,
  domain: insufficient<number>(0, 1), answered: 0, questionCount: 10,
  wrongCount: 0, reasons: ["motivo"], trendDown: false, unit: null,
  ...p,
});

test("lista vazia → null", () => {
  assert.equal(getNextStudyRecommendation([]), null);
});

test("sem conteúdo e sem questões → await_content (nunca omitido)", () => {
  const r = getNextStudyRecommendation([c({ topicId: "a", questionCount: 0 })]);
  assert.equal(r?.recommendedAction, "await_content");
});

test("cenário de hoje: 0 tentativas + questões → recomenda RESOLVER QUESTÕES", () => {
  const r = getNextStudyRecommendation([c({ topicId: "a" })]);
  assert.equal(r?.recommendedAction, "questions");
  assert.ok(r?.href.includes("/estudar/sessao"));
});

test("erro pendente em P1 vence tudo — dívida antes de avanço novo", () => {
  const r = getNextStudyRecommendation([
    c({ topicId: "novo", priorityScore: 95 }),
    c({ topicId: "comErro", priorityScore: 80, wrongCount: 3, answered: 10, domain: ok(50, 10) }),
  ]);
  assert.equal(r?.topicId, "comErro");
  assert.equal(r?.recommendedAction, "review_errors");
});

test("teoria disponível e não concluída → study_theory", () => {
  const r = getNextStudyRecommendation([c({
    topicId: "a", answered: 10, domain: ok(60, 10),
    unit: { id: "u1", title: "Unidade", hasTheory: true, theoryDone: false,
            hasFlashcards: false, flashcardsDone: false, hasQuiz: false, quizDone: false, lastStudiedAt: null },
  })]);
  assert.equal(r?.recommendedAction, "study_theory");
  assert.equal(r?.href, "/conteudos/u1");
});

test("consolidado mas regredindo → refazer", () => {
  const r = getNextStudyRecommendation([c({
    topicId: "a", answered: 20, domain: ok(90, 20), trendDown: true,
  })]);
  assert.equal(r?.recommendedAction, "redo");
});

test("domínio alto e estável → manutenção (não some da lista)", () => {
  const r = getNextStudyRecommendation([c({ topicId: "a", answered: 20, domain: ok(92, 20) })]);
  assert.equal(r?.recommendedAction, "maintenance");
});

test("escopo global pondera pelo peso da disciplina na prova", () => {
  const portugues = c({ topicId: "lp", disciplineWeight: 10, disciplineName: "Língua Portuguesa", priorityScore: 90 });
  const especificos = c({ topicId: "ce", disciplineWeight: 40, priorityScore: 80 });
  // 90*(10/60)=15 vs 80*(40/60)=53.3 → Específicos vence apesar do score menor
  assert.equal(getNextStudyRecommendation([portugues, especificos])?.topicId, "ce");
  // sem ponderação, dentro do bloco de básicos, Português aparece
  assert.equal(getNextStudyRecommendation([portugues, especificos], { scope: "basicos" })?.topicId, "lp");
});

test("excludeTopicIds permite 'ver outra sugestão'", () => {
  const r = getNextStudyRecommendation(
    [c({ topicId: "a", priorityScore: 90 }), c({ topicId: "b", priorityScore: 80 })],
    { excludeTopicIds: ["a"] },
  );
  assert.equal(r?.topicId, "b");
});

test("empate total é determinístico (não oscila entre requisições)", () => {
  const items = [c({ topicId: "z" }), c({ topicId: "a" }), c({ topicId: "m" })];
  const r1 = getStudyQueue(items).map((x) => x.topicId);
  const r2 = getStudyQueue([...items].reverse()).map((x) => x.topicId);
  assert.deepEqual(r1, r2);
  assert.equal(r1[0], "a");
});

test("tópicos sem nada acionável vão para o fim da fila", () => {
  const q = getStudyQueue([
    c({ topicId: "vazio", questionCount: 0, priorityScore: 99 }),
    c({ topicId: "comQuestoes", priorityScore: 50 }),
  ]);
  assert.equal(q[0].topicId, "comQuestoes");
  assert.equal(q[1].topicId, "vazio");
});

test("motivo nunca vem vazio", () => {
  const r = getNextStudyRecommendation([c({ topicId: "a" })]);
  assert.ok((r?.reason.length ?? 0) > 0);
});

test("alerta: P1 nunca estudado", () => {
  const a = computeAlerts([c({ topicId: "a", answered: 0 })]);
  assert.equal(a[0].kind, "critical_not_started");
  assert.equal(a[0].icon, "⚠️");
});

test("alerta: P1 com domínio baixo", () => {
  const a = computeAlerts([c({ topicId: "a", answered: 10, domain: ok(45, 10) })]);
  assert.equal(a[0].kind, "critical_low_domain");
});

test("P2+ não gera alerta crítico", () => {
  assert.equal(computeAlerts([c({ topicId: "a", level: "P2", answered: 0 })]).length, 0);
});
