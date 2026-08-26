import type { Measure } from "@/lib/domain/measure";
import { cn } from "@/lib/utils";

/**
 * Renderiza um Measure sem nunca inventar número. Componente único para todo
 * caso de base rala — se aparecer em algum lugar, o usuário vê exatamente
 * quanta amostra existe.
 */
export function MeasureValue({
  measure, format, note, className,
}: {
  measure: Measure<number>;
  format?: (v: number) => string;
  /** ex.: "base: 1 prova" */
  note?: string;
  className?: string;
}) {
  if (measure.kind === "ok") {
    return <span className={cn("font-mono tabular-nums", className)}>{format ? format(measure.value) : String(measure.value)}</span>;
  }
  return (
    <span className={cn("text-xs text-muted", className)} title={`Amostra: ${measure.sample} de ${measure.minimum} necessários`}>
      Dados insuficientes
      {note ? ` — ${note}` : ` (${measure.sample}/${measure.minimum})`}
    </span>
  );
}
