import { getAttemptRows } from "@/lib/db/stats";
import {
  overallStats, statsByDiscipline, statsByTopic, statsByBank, statsByOrigin, dailySeries,
} from "@/lib/domain/stats";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/stats/score-ring";
import { DisciplineBars } from "@/components/stats/discipline-bars";
import { EvolutionChart } from "@/components/stats/evolution-chart";

export const dynamic = "force-dynamic";

export default async function DesempenhoPage() {
  const rows = await getAttemptRows();
  const overall = overallStats(rows);
  const byDiscipline = statsByDiscipline(rows);
  const byTopic = statsByTopic(rows);
  const byBank = statsByBank(rows);
  const byOrigin = statsByOrigin(rows);
  const series = dailySeries(rows);

  const toBars = (items: { name: string; correct: number; answered: number; percentage: number }[]) =>
    items.map((t) => ({ name: t.name, correct: t.correct, total: t.answered, percentage: t.percentage }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Meu desempenho" subtitle="Acertos ÷ questões respondidas. Recortes por disciplina, tópico, banca e origem." />

      <Card>
        <CardContent className="flex flex-col items-center gap-5 pt-6 sm:flex-row sm:justify-around">
          <ScoreRing percentage={overall.percentage} label="acerto geral" />
          <div className="grid grid-cols-3 gap-6 text-center">
            <Metric label="Respondidas" value={overall.answered} />
            <Metric label="Acertos" value={overall.correct} tone="text-ok" />
            <Metric label="Erros" value={overall.wrong} tone="text-err" />
          </div>
        </CardContent>
      </Card>

      {series.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>Evolução</CardTitle></CardHeader>
          <CardContent><EvolutionChart points={series} /></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Por disciplina</CardTitle></CardHeader>
        <CardContent><DisciplineBars items={toBars(byDiscipline)} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Por tópico</CardTitle></CardHeader>
        <CardContent>
          {byTopic.length === 0 ? (
            <p className="text-sm text-muted">Responda questões com tópico para ver este recorte.</p>
          ) : <DisciplineBars items={toBars(byTopic)} />}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Por origem</CardTitle></CardHeader>
          <CardContent>
            {byOrigin.length === 0 ? <p className="text-sm text-muted">Sem dados.</p> : <DisciplineBars items={toBars(byOrigin)} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Por banca</CardTitle></CardHeader>
          <CardContent>
            {byBank.length === 0 ? <p className="text-sm text-muted">Sem dados.</p> : <DisciplineBars items={toBars(byBank)} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className={`text-xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
