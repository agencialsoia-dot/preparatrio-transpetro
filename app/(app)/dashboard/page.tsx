import Link from "next/link";
import { getAttemptRows } from "@/lib/db/stats";
import { listSimulados } from "@/lib/db/simulados";
import { listExams, countExamQuestions } from "@/lib/db/exams";
import { overallStats, statsByDiscipline } from "@/lib/domain/stats";
import { formatDuration } from "@/lib/domain/timer";
import { formatPercent, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisciplineBars } from "@/components/stats/discipline-bars";
import { BookOpen, ListChecks } from "lucide-react";

export default async function DashboardPage() {
  const [rows, simulados, exams] = await Promise.all([
    getAttemptRows(),
    listSimulados(),
    listExams(),
  ]);

  const overall = overallStats(rows);
  const byDiscipline = statsByDiscipline(rows);
  const finalizados = simulados.filter((s) => s.status === "finalizado");
  const ultimo = finalizados[0] ?? null;

  const provaReal = exams.find((e) => e.is_real_exam);
  const provaRealCount = provaReal ? await countExamQuestions(provaReal.id) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Minha Preparação" subtitle="Transpetro · Dutos e Terminais · Cesgranrio" />

      {/* CTAs principais */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-brand text-brand-fg">
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div>
              <p className="font-semibold">Fazer prova 2023</p>
              <p className="text-sm opacity-90">Diagnóstico com 60 questões</p>
            </div>
            <Button variant="subtle" asChild>
              <Link href="/simulados">
                <ListChecks /> Iniciar
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div>
              <p className="font-semibold">Estudar questões</p>
              <p className="text-sm text-muted">Correção imediata</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/estudar">
                <BookOpen /> Estudar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* progresso geral */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso geral</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Respondidas" value={overall.answered} />
          <Metric label="Acertos" value={formatPercent(overall.percentage, 0)} tone="text-ok" />
          <Metric
            label="Erros"
            value={formatPercent(overall.answered ? 100 - overall.percentage : 0, 0)}
            tone="text-err"
          />
          <Metric label="Simulados" value={finalizados.length} />
        </CardContent>
      </Card>

      {/* desempenho por disciplina */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por disciplina</CardTitle>
        </CardHeader>
        <CardContent>
          <DisciplineBars
            items={byDiscipline.map((d) => ({
              name: d.name,
              correct: d.correct,
              total: d.answered,
              percentage: d.percentage,
            }))}
          />
        </CardContent>
      </Card>

      {/* ultimo simulado */}
      <Card>
        <CardHeader>
          <CardTitle>Último simulado</CardTitle>
        </CardHeader>
        <CardContent>
          {ultimo ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{ultimo.exam_name}</p>
                <p className="text-sm text-muted">{formatDate(ultimo.started_at)}</p>
                <p className="mt-1 text-sm tabular-nums">
                  <strong>
                    {ultimo.correct_answers}/{ultimo.total_questions}
                  </strong>{" "}
                  · {formatPercent(ultimo.score_percentage ?? 0)} · {formatDuration(ultimo.total_time_seconds)}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/simulados/${ultimo.id}/resultado`}>Ver resultado</Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {provaRealCount > 0
                ? "Você ainda não fez nenhum simulado. Comece pela prova real de 2023."
                : "Importe a prova de 2023 para começar (npm run import)."}
            </p>
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
