import Link from "next/link";
import { listExams, countExamQuestions } from "@/lib/db/exams";
import { listSimulados } from "@/lib/db/simulados";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartButton } from "./start-button";
import { formatDate } from "@/lib/utils";
import { formatPercent } from "@/lib/utils";

export default async function SimuladosPage() {
  const exams = await listExams();
  const withCounts = await Promise.all(
    exams.map(async (e) => ({ exam: e, count: await countExamQuestions(e.id) })),
  );
  const reais = withCounts.filter((x) => x.exam.is_real_exam);
  const amostras = withCounts.filter((x) => x.exam.is_sample);
  const simulados = await listSimulados();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Simulados" subtitle="Faça a prova real como diagnóstico." />

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Provas reais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {reais.map(({ exam, count }) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{exam.name}</CardTitle>
                  <Badge>Prova real</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                  {exam.category} · {count} questões · {exam.bank}
                </p>
                <StartButton examId={exam.id} disabled={count === 0} />
                {count === 0 && (
                  <p className="text-xs text-muted">
                    Conteúdo ainda não importado. Rode <code>npm run import</code>.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {amostras.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Amostra</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {amostras.map(({ exam, count }) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{exam.name}</CardTitle>
                    <Badge variant="sample">Exemplo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted">{count} questões de demonstração — não é a prova real.</p>
                  <StartButton examId={exam.id} disabled={count === 0} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Meus simulados</h2>
        {simulados.length === 0 ? (
          <p className="text-sm text-muted">Você ainda não fez nenhum simulado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {simulados.map((s) => (
              <li key={s.id}>
                <Link
                  href={s.status === "finalizado" ? `/simulados/${s.id}/resultado` : `/simulados/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:bg-brand-soft/50"
                >
                  <div>
                    <p className="text-sm font-medium">{s.exam_name}</p>
                    <p className="text-xs text-muted">{formatDate(s.started_at)}</p>
                  </div>
                  <div className="text-right">
                    {s.status === "finalizado" ? (
                      <>
                        <p className="text-sm font-semibold tabular-nums">
                          {s.correct_answers}/{s.total_questions}
                        </p>
                        <p className="text-xs text-muted">{formatPercent(s.score_percentage ?? 0)}</p>
                      </>
                    ) : (
                      <Badge variant="neutral">Em andamento</Badge>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
