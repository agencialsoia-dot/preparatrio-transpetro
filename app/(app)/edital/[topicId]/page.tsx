import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/stats/status-pill";
import { getTopicById, getTopicStats, getTopicQuestionCounts } from "@/lib/db/topics";
import { computeStatus } from "@/lib/domain/status";
import { percent } from "@/lib/domain/scoring";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const [topic, stats, counts] = await Promise.all([
    getTopicById(topicId),
    getTopicStats(),
    getTopicQuestionCounts(),
  ]);
  if (!topic) notFound();

  const s = stats.get(topicId) ?? { answered: 0, correct: 0 };
  const p = percent(s.correct, s.answered);
  const status = computeStatus(s.answered, p);
  const qCount = counts.get(topicId) ?? 0;
  const base = `/estudar/sessao?disciplina=${topic.discipline_id}&topico=${topicId}`;

  return (
    <div>
      <PageHeader title={topic.name} subtitle={topic.code ? `Tópico ${topic.code}` : undefined} action={<StatusPill status={status} />} />

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
