import { formatPercent } from "@/lib/utils";

/** Anel de percentual simples em SVG — sem biblioteca de graficos. */
export function ScoreRing({
  percentage,
  label,
  size = 132,
}: {
  percentage: number;
  label?: string;
  size?: number;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percentage));
  const tone = pct >= 70 ? "var(--color-ok)" : pct >= 50 ? "var(--color-brand)" : "var(--color-err)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums">{formatPercent(percentage, 1)}</span>
        {label && <span className="text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
