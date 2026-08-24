"use client";

import { cn } from "@/lib/utils";
import type { Letter } from "@/lib/types/database";

export interface OptionItem {
  letter: Letter;
  text: string;
}

interface OptionListProps {
  options: OptionItem[];
  selected: Letter | null;
  /** Marca gabarito/erro (modo estudo e revisao). */
  correct?: Letter | null;
  reveal?: boolean;
  disabled?: boolean;
  onSelect?: (letter: Letter) => void;
}

/** Lista de alternativas reutilizada em simulado, estudo e revisao. */
export function OptionList({
  options,
  selected,
  correct,
  reveal = false,
  disabled = false,
  onSelect,
}: OptionListProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = selected === opt.letter;
        const isCorrect = reveal && correct === opt.letter;
        const isWrongPick = reveal && isSelected && correct !== opt.letter;

        return (
          <li key={opt.letter}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(opt.letter)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                "disabled:cursor-default",
                !reveal && isSelected && "border-brand bg-brand-soft",
                !reveal && !isSelected && "border-border bg-surface hover:bg-brand-soft/60",
                isCorrect && "border-ok bg-ok-soft",
                isWrongPick && "border-err bg-err-soft",
                reveal && !isCorrect && !isWrongPick && "border-border bg-surface",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  !reveal && isSelected && "bg-brand text-brand-fg",
                  !reveal && !isSelected && "bg-bg text-muted",
                  isCorrect && "bg-ok text-white",
                  isWrongPick && "bg-err text-white",
                  reveal && !isCorrect && !isWrongPick && "bg-bg text-muted",
                )}
              >
                {opt.letter}
              </span>
              <span className="pt-0.5 text-[15px] leading-relaxed">{opt.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
