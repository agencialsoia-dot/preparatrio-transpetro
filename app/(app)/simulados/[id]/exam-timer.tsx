"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { elapsedFrom, formatDuration } from "@/lib/domain/timer";

/** Cronometro visual. A fonte de verdade e started_at (servidor). */
export function ExamTimer({ startedAt }: { startedAt: string }) {
  const [seconds, setSeconds] = useState(() => elapsedFrom(startedAt));

  useEffect(() => {
    const tick = () => setSeconds(elapsedFrom(startedAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums text-sm font-medium text-muted">
      <Clock className="size-4" />
      {formatDuration(seconds)}
    </span>
  );
}
