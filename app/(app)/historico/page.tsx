import Link from "next/link";
import { listSimulados } from "@/lib/db/simulados";
import { formatPercent, formatDate } from "@/lib/utils";
import { formatDurationShort } from "@/lib/domain/timer";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export default async function HistoricoPage() {
  const simulados = await listSimulados();

  return (
    <div>
      <PageHeader title="Histórico" subtitle="Seus simulados, do mais recente ao mais antigo." />
      {simulados.length === 0 ? (
        <p className="text-sm text-muted">Nada por aqui ainda.</p>
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
                  <p className="text-xs text-muted">
                    {formatDate(s.started_at)}
                    {s.status === "finalizado" && s.total_time_seconds != null &&
                      ` · ${formatDurationShort(s.total_time_seconds)}`}
                  </p>
                </div>
                {s.status === "finalizado" ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {s.correct_answers}/{s.total_questions}
                    </p>
                    <p className="text-xs text-muted">{formatPercent(s.score_percentage ?? 0)}</p>
                  </div>
                ) : (
                  <Badge variant="neutral">Em andamento</Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
