import type { StatusInfo } from "@/lib/domain/status";
import { cn } from "@/lib/utils";

const TONE: Record<StatusInfo["tone"], string> = {
  muted: "bg-bg text-muted border-border",
  info: "bg-brand-soft text-brand border-transparent",
  warn: "bg-amber-soft text-amber border-transparent",
  err: "bg-err-soft text-err border-transparent",
  ok: "bg-ok-soft text-ok border-transparent",
};

export function StatusPill({ status, className }: { status: StatusInfo; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE[status.tone],
        className,
      )}
    >
      <span aria-hidden>{status.dot}</span>
      {status.label}
    </span>
  );
}
