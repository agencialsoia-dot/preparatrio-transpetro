import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/priority/priority-badge";
import { TopicPriorityRow } from "@/components/priority/topic-priority-row";
import { buildTopicSnapshots, getIncidenceBase, type TopicSnapshot } from "@/lib/db/priority";
import { PRIORITY_LEVELS } from "@/lib/domain/priority";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "criticos", label: "🔥 Críticos" },
  { id: "P1", label: "P1" }, { id: "P2", label: "P2" },
  { id: "P3", label: "P3" }, { id: "P4", label: "P4" },
  { id: "erros", label: "Meus erros" },
  { id: "sem-questoes", label: "Sem questões" },
];

function applyFilter(list: TopicSnapshot[], f: string): TopicSnapshot[] {
  switch (f) {
    case "criticos":
      // P1 + domínio abaixo de 70 (ou sem base): o que realmente dói
      return list.filter((s) => s.priority.level === "P1" &&
        (s.domain.kind !== "ok" || s.domain.value < 70));
    case "P1": case "P2": case "P3": case "P4":
      return list.filter((s) => s.priority.level === f);
    case "erros": return list.filter((s) => s.wrongCount > 0);
    case "sem-questoes": return list.filter((s) => s.questionCount === 0);
    default: return list;
  }
}

export default async function MapaPage({
  searchParams,
}: { searchParams: Promise<{ f?: string }> }) {
  const { f = "todas" } = await searchParams;
  const [all, base] = await Promise.all([buildTopicSnapshots(), getIncidenceBase()]);

  // só folhas (tópicos sem filhos) — os grupos organizadores agregam, não competem
  const parentIds = new Set(all.map((s) => s.parentId).filter(Boolean) as string[]);
  const leaves = all.filter((s) => !parentIds.has(s.topicId));

  const filtered = applyFilter(leaves, f);
  const byScore = (a: TopicSnapshot, b: TopicSnapshot) =>
    b.score.score - a.score.score || a.answered - b.answered || a.topicId.localeCompare(b.topicId);

  const basicos = filtered.filter((s) => s.disciplineWeight <= 10).sort(byScore);
  const especificos = filtered.filter((s) => s.disciplineWeight > 10).sort(byScore);

  // TOP 5 global ponderado pelo peso da disciplina na prova
  const top5 = [...filtered]
    .sort((a, b) =>
      b.score.score * (b.disciplineWeight / 60) - a.score.score * (a.disciplineWeight / 60) ||
      byScore(a, b))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mapa Pós-Edital"
        subtitle="Onde vale mais investir seu tempo — o que a prova cobra cruzado com o que você ainda não domina."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <Link key={x.id} href={`/conteudos/mapa?f=${x.id}`}
            className={cn("rounded-lg border px-3 py-1.5 text-sm font-medium",
              f === x.id ? "border-brand bg-brand text-brand-fg" : "border-border bg-surface hover:bg-brand-soft")}>
            {x.label}
          </Link>
        ))}
      </div>

      {!base.sufficient && (
        <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
          Incidência histórica indisponível — base atual: <strong>{base.exams} prova</strong> ({base.questions} questões).
          A prioridade está sendo calculada sem esse componente e o peso foi redistribuído.
          Importe mais provas para ativá-lo.
        </p>
      )}

      {top5.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-err">
              🔥 Top 5 prioridades
            </div>
            <ol className="flex flex-col gap-2">
              {top5.map((s, i) => (
                <li key={s.topicId} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 font-mono text-sm text-muted">{i + 1}.</span>
                  <Link href={`/edital/${s.topicId}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand">
                    {s.topicName}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">{s.disciplineName}</span>
                  <PriorityBadge level={s.priority.level} compact />
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Bloco titulo="Conhecimentos Básicos" nota="20 questões — Português 10 · Matemática 10" itens={basicos} />
      <Bloco titulo="Conhecimentos Específicos" nota="40 questões — Dutos e Terminais" itens={especificos} />

      <p className="text-xs text-muted">
        Prioridade não é previsão: mede o que historicamente cai e o que você ainda não domina.
        Níveis: {PRIORITY_LEVELS.map((l) => <PriorityBadge key={l} level={l} compact className="mx-0.5" />)}
      </p>
    </div>
  );
}

function Bloco({ titulo, nota, itens }: { titulo: string; nota: string; itens: TopicSnapshot[] }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">{titulo}</h2>
        <span className="text-xs text-muted">{nota}</span>
      </div>
      {itens.length === 0 ? (
        <p className="text-sm text-muted">Nenhum tópico neste filtro.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {itens.map((s) => <TopicPriorityRow key={s.topicId} s={s} />)}
        </div>
      )}
    </section>
  );
}
