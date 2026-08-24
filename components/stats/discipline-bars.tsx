import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";

export interface DisciplineBar {
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

export function DisciplineBars({ items }: { items: DisciplineBar[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Ainda sem dados por disciplina.</p>;
  }
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((d) => (
        <li key={d.name}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{d.name}</span>
            <span className="tabular-nums text-muted">
              {d.correct}/{d.total} · {formatPercent(d.percentage)}
            </span>
          </div>
          <Progress
            value={d.percentage}
            tone={d.percentage >= 70 ? "ok" : d.percentage >= 50 ? "brand" : "err"}
          />
        </li>
      ))}
    </ul>
  );
}
