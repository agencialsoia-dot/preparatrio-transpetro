import { getAttemptRows } from "@/lib/db/stats";
import { overallStats, statsByDiscipline, statsByTopic } from "@/lib/domain/stats";
import { formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/stats/score-ring";
import { DisciplineBars } from "@/components/stats/discipline-bars";

export default async function DesempenhoPage() {
  const rows = await getAttemptRows();
  const overall = overallStats(rows);
  const byDiscipline = statsByDiscipline(rows);
  const byTopic = statsByTopic(rows);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Meu desempenho" subtitle="Acertos ÷ questões respondidas." />

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

      <Card>
        <CardHeader><CardTitle>Por disciplina</CardTitle></CardHeader>
        <CardContent>
          <DisciplineBars
            items={byDiscipline.map((d) => ({ name: d.name, correct: d.correct, total: d.answered, percentage: d.percentage }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Por tópico</CardTitle></CardHeader>
        <CardContent>
          {byTopic.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhum tópico cadastrado ainda. Quando as questões tiverem tópicos, o recorte aparece aqui.
            </p>
          ) : (
            <DisciplineBars
              items={byTopic.map((t) => ({ name: t.name, correct: t.correct, total: t.answered, percentage: t.percentage }))}
            />
          )}
        </CardContent>
      </Card>
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
