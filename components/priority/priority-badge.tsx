import { PRIORITY_MAP, type PriorityLevel } from "@/lib/domain/priority";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  err: "bg-err-soft text-err",
  warn: "bg-amber-soft text-amber",
  info: "bg-brand-soft text-brand",
  muted: "bg-bg text-muted border border-border",
};

/** Prioridade sempre com ícone + texto — cor nunca carrega a informação sozinha. */
export function PriorityBadge({
  level, className, compact = false,
}: { level: PriorityLevel; className?: string; compact?: boolean }) {
  const p = PRIORITY_MAP[level];
  return (
    <span
      title={p.label}
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[p.tone], className)}
    >
      <span aria-hidden>{p.icon}</span>
      {compact ? p.key : `${p.key} · ${p.label}`}
    </span>
  );
}
