import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 0–100 */
  value: number;
  className?: string;
  tone?: "brand" | "ok" | "err";
}

export function Progress({ value, className, tone = "brand" }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  const bar = tone === "ok" ? "bg-ok" : tone === "err" ? "bg-err" : "bg-brand";
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}
    >
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}
