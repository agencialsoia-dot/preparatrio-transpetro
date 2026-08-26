import Link from "next/link";
import { PriorityBadge } from "./priority-badge";
import { MeasureValue } from "./insufficient-data";
import { StatusPill } from "@/components/stats/status-pill";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import type { TopicSnapshot } from "@/lib/db/priority";

/** Linha do mapa: prioridade + domínio + status, com barra de score. */
export function TopicPriorityRow({ s }: { s: TopicSnapshot }) {
  return (
    <Link
      href={`/edital/${s.topicId}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 hover:border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{s.topicName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{s.questionCount} questões</span>
            <span>·</span>
            <span>
              Domínio:{" "}
              <MeasureValue measure={s.domain} format={(v) => formatPercent(v)} className="text-fg" />
            </span>
            {s.wrongCount > 0 && <><span>·</span><span className="text-err">{s.wrongCount} erradas</span></>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <PriorityBadge level={s.priority.level} compact />
          <StatusPill status={s.status} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress
          value={s.score.score}
          tone={s.priority.level === "P1" ? "err" : s.priority.level === "P2" ? "brand" : "ok"}
          className="h-1.5"
        />
        <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">{Math.round(s.score.score)}</span>
      </div>
    </Link>
  );
}
