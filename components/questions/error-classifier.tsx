"use client";

import { ERROR_TYPES } from "@/lib/domain/errors";
import { ERROR_TYPE_MAP } from "@/lib/domain/errors";
import { cn } from "@/lib/utils";
import type { ErrorType } from "@/lib/types/database";

/** Pergunta "Por que você errou?" e registra a classificação (§16). */
export function ErrorClassifier({
  value,
  onSelect,
}: {
  value: ErrorType | null;
  onSelect: (type: ErrorType) => void;
}) {
  if (value) {
    return (
      <p className="text-sm text-muted">
        Motivo registrado: <strong className="text-fg">{ERROR_TYPE_MAP[value].dot} {ERROR_TYPE_MAP[value].label}</strong>
      </p>
    );
  }
  return (
    <div>
      <div className="mb-2 text-sm font-medium">Por que você errou?</div>
      <div className="flex flex-wrap gap-2">
        {ERROR_TYPES.map((e) => (
          <button
            key={e.key}
            onClick={() => onSelect(e.key)}
            className={cn(
              "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium",
              "hover:border-brand hover:bg-brand-soft",
            )}
          >
            <span aria-hidden>{e.dot}</span> {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
