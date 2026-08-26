import { PageHeader } from "@/components/layout/page-header";
import { getEditalTree, getTopicStats, getTopicQuestionCounts, type TopicNode } from "@/lib/db/topics";
import { EditalTree, type EditalNodeData, type EditalDisciplineData } from "./edital-tree";

export const dynamic = "force-dynamic";

export default async function EditalPage() {
  const [tree, stats, counts] = await Promise.all([
    getEditalTree(),
    getTopicStats(),
    getTopicQuestionCounts(),
  ]);

  // Converte a árvore em dados com estatística agregada (folha → soma nos pais).
  function build(node: TopicNode): EditalNodeData {
    const children = node.children.map(build);
    const self = stats.get(node.topic.id);
    let answered = self?.answered ?? 0;
    let correct = self?.correct ?? 0;
    let questions = counts.get(node.topic.id) ?? 0;
    for (const c of children) {
      answered += c.answered;
      correct += c.correct;
      questions += c.questions;
    }
    return { id: node.topic.id, name: node.topic.name, code: node.topic.code, answered, correct, questions, children };
  }

  const disciplines: EditalDisciplineData[] = tree.map((d) => {
    const roots = d.roots.map(build);
    const answered = roots.reduce((n, r) => n + r.answered, 0);
    const correct = roots.reduce((n, r) => n + r.correct, 0);
    return { id: d.discipline.id, name: d.discipline.name, answered, correct, roots };
  });

  return (
    <div>
      <PageHeader
        title="Meu Edital"
        subtitle="Transpetro 2026.3 · Ênfase 4 — Dutos e Terminais. Status por tópico com base no seu desempenho."
      />
      <EditalTree disciplines={disciplines} />
    </div>
  );
}
