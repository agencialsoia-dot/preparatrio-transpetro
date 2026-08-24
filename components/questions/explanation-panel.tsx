import { Badge } from "@/components/ui/badge";

/** Explicacao da questao. Rotula claramente quando gerada por IA. */
export function ExplanationPanel({
  explanation,
  source,
}: {
  explanation: string | null;
  source: string | null;
}) {
  if (!explanation) {
    return (
      <p className="rounded-xl bg-bg px-4 py-3 text-sm text-muted">
        Sem explicação cadastrada para esta questão.
      </p>
    );
  }
  return (
    <div className="rounded-xl bg-bg px-4 py-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm font-semibold">Explicação</span>
        {source === "ia" && <Badge variant="neutral">Gerada por IA</Badge>}
      </div>
      <p className="enunciado text-sm text-fg/90">{explanation}</p>
    </div>
  );
}
