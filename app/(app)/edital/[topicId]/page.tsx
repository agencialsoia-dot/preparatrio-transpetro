import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/stats/status-pill";
import { getTopicById, getTopicStats, getTopicQuestionCounts } from "@/lib/db/topics";
import { buildTopicSnapshots, getIncidenceBase } from "@/lib/db/priority";
import { PriorityBadge } from "@/components/priority/priority-badge";
import { MeasureValue } from "@/components/priority/insufficient-data";
import { computeStatus } from "@/lib/domain/status";
import { percent } from "@/lib/domain/scoring";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const [topic, stats, counts, snapshots, incidenceBase] = await Promise.all([
    getTopicById(topicId),
    getTopicStats(),
    getTopicQuestionCounts(),
    buildTopicSnapshots(),
    getIncidenceBase(),
  ]);
  const snap = snapshots.find((x) => x.topicId === topicId) ?? null;
  if (!topic) notFound();

  const s = stats.get(topicId) ?? { answered: 0, correct: 0 };
  const p = percent(s.correct, s.answered);
  const status = computeStatus(s.answered, p);
  const qCount = counts.get(topicId) ?? 0;
  const base = `/estudar/sessao?disciplina=${topic.discipline_id}&topico=${topicId}`;

  return (
    <div>
      <PageHeader title={topic.name} subtitle={topic.code ? `Tópico ${topic.code}` : undefined} action={<div className="flex items-center gap-2">{snap && <PriorityBadge level={snap.priority.level} />}<StatusPill status={status} /></div>} />

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div><div className="font-mono text-2xl font-bold tracking-tight">{formatPercent(p)}</div><div className="mt-1 text-xs text-muted">Aproveitamento</div></div>
            <div><div className="font-mono text-2xl font-bold">{s.answered}</div><div className="mt-1 text-xs text-muted">Respondidas</div></div>
            <div><div className="font-mono text-2xl font-bold text-ok">{s.correct}</div><div className="mt-1 text-xs text-muted">Acertos</div></div>
            <div><div className="font-mono text-2xl font-bold text-err">{s.answered - s.correct}</div><div className="mt-1 text-xs text-muted">Erros</div></div>
          </div>
        </CardContent>
      </Card>

      {snap && (
        <Card className="mb-4">
          <CardContent className="pt-5">
            <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-brand">
              🎯 Por que este assunto é importante?
            </div>
            {snap.reasons.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {snap.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="text-ok">✓</span>{r}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Sem justificativa registrada.</p>}

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted">Prioridade de estudo</div>
                <div className="font-mono text-lg font-semibold">{Math.round(snap.score.score)}<span className="text-sm text-muted">/100</span></div>
              </div>
              <div>
                <div className="text-xs text-muted">Incidência histórica</div>
                <div className="text-lg">
                  <MeasureValue measure={snap.incidence} format={(v) => `${v}%`}
                    note={`base: ${incidenceBase.exams} prova${incidenceBase.exams === 1 ? "" : "s"}`} />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Tendência</div>
                <div className="text-sm">
                  {snap.trend.direction === "unknown" ? <span className="text-xs text-muted">Dados insuficientes</span>
                    : snap.trend.direction === "up" ? <span className="text-ok">▲ melhorando</span>
                    : snap.trend.direction === "down" ? <span className="text-err">▼ caindo</span>
                    : <span className="text-muted">estável</span>}
                </div>
              </div>
            </div>
            {snap.score.confidence !== "high" && (
              <p className="mt-3 text-xs text-muted">
                Prioridade calculada com dados parciais ({snap.score.missing.join(", ")} indisponível).
              </p>
            )}
            {snap.examFocusNote && (
              <div className="mt-4 border-t border-border pt-4">
                <div className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-brand">📌 O que mais cai</div>
                <p className="text-sm text-muted">{snap.examFocusNote}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-brand">Praticar questões</div>
          {qCount === 0 ? (
            <p className="text-sm text-muted">Ainda não há questões cadastradas neste tópico.</p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={`${base}&modo=novas&quantidade=10`} className="flex-1"><Button className="w-full">Estudar 10 novas</Button></Link>
              <Link href={`${base}&modo=erradas&quantidade=10`} className="flex-1"><Button variant="outline" className="w-full">Questões erradas</Button></Link>
              <Link href={`${base}&modo=todas&quantidade=10`} className="flex-1"><Button variant="outline" className="w-full">Todas</Button></Link>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">{qCount} questão(ões) neste tópico.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-brand">Conteúdo</div>
          <p className="text-sm text-muted">
            O material de estudo deste tópico (teoria, vídeo, flashcards e quiz) chega na próxima
            etapa (V1.6 — Módulo de Conteúdos).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
