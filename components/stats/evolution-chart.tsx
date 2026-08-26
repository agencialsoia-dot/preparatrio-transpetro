import type { DailyPoint } from "@/lib/domain/stats";
import { formatPercent } from "@/lib/utils";

/** Sparkline simples de % de acerto por dia (sem libs). */
export function EvolutionChart({ points }: { points: DailyPoint[] }) {
  const w = 100, h = 34;
  const xs = points.map((_, i) => (points.length === 1 ? 0 : (i / (points.length - 1)) * w));
  const ys = points.map((p) => h - (p.percentage / 100) * h);
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const first = points[0], last = points[points.length - 1];
  const trend = last.percentage - first.percentage;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-2xl font-bold">{formatPercent(last.percentage)}</span>
        <span className={`text-sm font-medium ${trend >= 0 ? "text-ok" : "text-err"}`}>
          {trend >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(trend))} vs. início
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 h-16 w-full overflow-visible">
        <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="1.4" fill="var(--color-brand)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{new Date(first.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
        <span>{new Date(last.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
      </div>
    </div>
  );
}
