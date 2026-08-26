import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NextActionCard } from "@/components/priority/next-action-card";
import { PriorityBadge } from "@/components/priority/priority-badge";
import { buildTopicSnapshots, toRecommendationInputs, getIncidenceBase } from "@/lib/db/priority";
import { computeAlerts, getStudyQueue } from "@/lib/domain/recommendation";
import { formatPercent } from "@/lib/utils";
import { isOk } from "@/lib/domain/measure";

export const dynamic = "force-dynamic";

export default async function ConteudosPage() {
  const [snapshots, base] = await Promise.all([buildTopicSnapshots(), getIncidenceBase()]);
  const inputs = toRecommendationInputs(snapshots);
  const queue = getStudyQueue(inputs, { limit: 6 });
  const next = queue[0] ?? null;
  const alerts = computeAlerts(inputs).slice(0, 4);

  const leaves = inputs;
  const estudados = leaves.filter((l) => l.answered > 0).length;
  const consolidados = snapshots.filter((s) => s.status.key === "consolidado").length;
  const criticos = leaves.filter((l) => l.level === "P1");
  const criticosEstudados = criticos.filter((l) => l.answered > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conteúdos"
        subtitle="Ênfase 4 — Dutos e Terminais. Estudo orientado por prioridade, não por ordem do edital."
        action={<Button asChild variant="outline" size="sm"><Link href="/conteudos/mapa">Ver mapa completo</Link></Button>}
      />

      {/* 1. o que estudar agora — primeiro no mobile, conforme o plano */}
      {next ? <NextActionCard rec={next} /> : (
        <Card><CardContent className="py-10 text-center text-sm text-muted">
          Nenhum tópico com questões ou conteúdo cadastrado ainda.
        </CardContent></Card>
      )}

      {/* 2. alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-err">Atenção</div>
            <ul className="flex flex-col gap-2">
              {alerts.map((a) => (
                <li key={`${a.kind}-${a.topicId}`} className="flex items-start gap-2 text-sm">
                  <span aria-hidden>{a.icon}</span>
                  <Link href={`/edital/${a.topicId}`} className="font-medium hover:text-brand">{a.topicName}</Link>
                  <span className="text-muted">— {a.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 3. críticos */}
      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">🔥 Conteúdos críticos</span>
            <Link href="/conteudos/mapa?f=criticos" className="text-xs font-medium text-brand hover:underline">ver todos</Link>
          </div>
          <ul className="flex flex-col gap-2">
            {queue.slice(0, 5).map((r) => (
              <li key={r.topicId} className="flex items-center justify-between gap-3">
                <Link href={`/edital/${r.topicId}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand">
                  {r.title}
                </Link>
                <span className="shrink-0 text-xs text-muted">
                  {isOk(r.domain) ? formatPercent(r.domain.value) : "sem dados"}
                </span>
                <PriorityBadge level={r.level} compact />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 4. cobertura — linguagem honesta: conteúdo estudado, nunca "% preparado" */}
      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-brand">📊 Cobertura do edital</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-mono text-2xl font-bold">{formatPercent((estudados / Math.max(1, leaves.length)) * 100, 0)}</div>
              <div className="mt-1 text-xs text-muted">do conteúdo estudado</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-ok">{formatPercent((consolidados / Math.max(1, leaves.length)) * 100, 0)}</div>
              <div className="mt-1 text-xs text-muted">consolidado</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-err">{formatPercent((criticosEstudados / Math.max(1, criticos.length)) * 100, 0)}</div>
              <div className="mt-1 text-xs text-muted">dos críticos estudado</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Mede conteúdo percorrido — não é estimativa de aprovação.
            {!base.sufficient && ` Incidência histórica indisponível (base: ${base.exams} prova).`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 text-xs text-muted">
          A trilha de estudo (teoria, vídeo, flashcards e quiz) chega na próxima etapa. Por enquanto,
          a recomendação aponta para as <strong>questões</strong> — que é o que já existe cadastrado.
        </CardContent>
      </Card>
    </div>
  );
}
