import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSimulado, getGradableQuestions } from "@/lib/db/simulados";
import { scoreSimulado } from "@/lib/domain/scoring";
import { formatDuration } from "@/lib/domain/timer";
import { formatPercent } from "@/lib/utils";
import { ScoreRing } from "@/components/stats/score-ring";
import { DisciplineBars } from "@/components/stats/discipline-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sim = await getSimulado(id);
  if (!sim) notFound();
  if (sim.status !== "finalizado") redirect(`/simulados/${id}`);

  const graded = await getGradableQuestions(id);
  const score = scoreSimulado(graded);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resultado</h1>
        <p className="mt-1 text-sm text-muted">{sim.title}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-around">
          <ScoreRing percentage={score.percentage} label="de acerto" />
          <div className="grid grid-cols-3 gap-6 text-center">
            <Stat label="Acertos" value={score.correct} tone="text-ok" />
            <Stat label="Erros" value={score.wrong + score.blank} tone="text-err" />
            <Stat label="Tempo" value={formatDuration(sim.total_time_seconds)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por disciplina</CardTitle>
        </CardHeader>
        <CardContent>
          <DisciplineBars
            items={score.byDiscipline.map((d) => ({
              name: d.discipline_name,
              correct: d.correct,
              total: d.total,
              percentage: d.percentage,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questões erradas ({score.wrongQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {score.wrongQuestions.length === 0 ? (
            <p className="text-sm text-muted">Você acertou todas. 👏</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {score.wrongQuestions.map((w) => (
                <li key={w.question_id}>
                  <Link
                    href={`/simulados/${id}/revisao?q=${w.question_order}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-sm hover:bg-brand-soft"
                  >
                    Questão {String(w.question_number).padStart(2, "0")}
                    <span className="text-xs text-muted">
                      · {w.selected_answer ?? "—"} → {w.correct_answer}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/simulados/${id}/revisao`}>Revisar todas as questões</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className={`text-xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
