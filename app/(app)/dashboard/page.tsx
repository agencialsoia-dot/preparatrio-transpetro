import Link from "next/link";
import { getAttemptRows } from "@/lib/db/stats";
import { getTopicStats as topicStatsMap } from "@/lib/db/topics";
import { getEditalTree } from "@/lib/db/topics";
import { listSimulados } from "@/lib/db/simulados";
import { listExams, countExamQuestions } from "@/lib/db/exams";
import { overallStats, statsByDiscipline, strongWeakDisciplines } from "@/lib/domain/stats";
import { percent } from "@/lib/domain/scoring";
import { computeStatus, MIN_ANSWERED_FOR_STATUS } from "@/lib/domain/status";
import { formatDuration } from "@/lib/domain/timer";
import { formatPercent, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisciplineBars } from "@/components/stats/discipline-bars";
import { BookOpen, ListChecks, Target } from "lucide-react";
import type { TopicNode } from "@/lib/db/topics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [rows, tstats, tree, simulados, exams] = await Promise.all([
    getAttemptRows(),
    topicStatsMap(),
    getEditalTree(),
    listSimulados(),
    listExams(),
  ]);

  const overall = overallStats(rows);
  const byDiscipline = statsByDiscipline(rows);
  const { strong, weak } = strongWeakDisciplines(rows);
  const finalizados = simulados.filter((s) => s.status === "finalizado");
  const ultimo = finalizados[0] ?? null;
  const provaReal = exams.find((e) => e.is_real_exam);
  const provaRealCount = provaReal ? await countExamQuestions(provaReal.id) : 0;

  // folhas do edital → estudadas × não estudadas + próxima ação (pior com amostra)
  const leaves: { id: string; name: string }[] = [];
  const walk = (n: TopicNode) => (n.children.length ? n.children.forEach(walk) : leaves.push({ id: n.topic.id, name: n.topic.name }));
  tree.forEach((d) => d.roots.forEach(walk));
  const studied = leaves.filter((l) => (tstats.get(l.id)?.answered ?? 0) > 0);
  const withSample = leaves
    .map((l) => { const s = tstats.get(l.id); return { ...l, answered: s?.answered ?? 0, pct: percent(s?.correct ?? 0, s?.answered ?? 0) }; })
    .filter((l) => l.answered >= MIN_ANSWERED_FOR_STATUS)
    .sort((a, b) => a.pct - b.pct);
  const nextTopic = withSample[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Minha Preparação" subtitle="Transpetro 2026.3 · Dutos e Terminais · Cesgranrio" />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-brand text-brand-fg">
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div><p className="font-semibold">Fazer prova 2023</p><p className="text-sm opacity-90">Diagnóstico com 60 questões</p></div>
            <Button variant="subtle" asChild><Link href="/simulados"><ListChecks /> Iniciar</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div><p className="font-semibold">Estudar questões</p><p className="text-sm text-muted">Correção imediata</p></div>
            <Button variant="outline" asChild><Link href="/questoes"><BookOpen /> Estudar</Link></Button>
          </CardContent>
        </Card>
      </div>

      {nextTopic && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-3">
              <Target className="size-5 text-err" />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-err">Próxima ação</p>
                <p className="font-medium">Seu menor desempenho está em <strong>{nextTopic.name}</strong> ({formatPercent(nextTopic.pct)}).</p>
              </div>
            </div>
            <Button asChild><Link href={`/edital/${nextTopic.id}`}>Estudar {nextTopic.name.split(":")[0]}</Link></Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Progresso geral</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Respondidas" value={overall.answered} />
          <Metric label="Aproveitamento" value={formatPercent(overall.percentage, 0)} tone="text-ok" />
          <Metric label="Tópicos estudados" value={`${studied.length}/${leaves.length}`} />
          <Metric label="Simulados" value={finalizados.length} />
        </CardContent>
      </Card>

      {(strong.length > 0 || weak.length > 0) && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Pontos fortes</CardTitle></CardHeader>
            <CardContent>
              {strong.length ? <ul className="flex flex-col gap-1.5 text-sm">{strong.map((s) => <li key={s.id} className="flex justify-between"><span>{s.name}</span><span className="font-mono text-ok">{formatPercent(s.percentage)}</span></li>)}</ul> : <p className="text-sm text-muted">—</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pontos fracos</CardTitle></CardHeader>
            <CardContent>
              {weak.length ? <ul className="flex flex-col gap-1.5 text-sm">{weak.map((s) => <li key={s.id} className="flex justify-between"><span>{s.name}</span><span className="font-mono text-err">{formatPercent(s.percentage)}</span></li>)}</ul> : <p className="text-sm text-muted">—</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Desempenho por disciplina</CardTitle></CardHeader>
        <CardContent>
          <DisciplineBars items={byDiscipline.map((d) => ({ name: d.name, correct: d.correct, total: d.answered, percentage: d.percentage }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Último simulado</CardTitle></CardHeader>
        <CardContent>
          {ultimo ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{ultimo.exam_name}</p>
                <p className="text-sm text-muted">{formatDate(ultimo.started_at)}</p>
                <p className="mt-1 text-sm tabular-nums"><strong>{ultimo.correct_answers}/{ultimo.total_questions}</strong> · {formatPercent(ultimo.score_percentage ?? 0)} · {formatDuration(ultimo.total_time_seconds)}</p>
              </div>
              <Button variant="outline" asChild><Link href={`/simulados/${ultimo.id}/resultado`}>Ver resultado</Link></Button>
            </div>
          ) : (
            <p className="text-sm text-muted">{provaRealCount > 0 ? "Você ainda não fez nenhum simulado. Comece pela prova real de 2023." : "Importe a prova de 2023 para começar."}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className={`text-2xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
