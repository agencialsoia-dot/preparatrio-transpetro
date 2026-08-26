import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { MeasureValue } from "./insufficient-data";
import { formatPercent } from "@/lib/utils";
import type { Recommendation } from "@/lib/domain/recommendation";
import { Target } from "lucide-react";

/** A CTA principal do módulo: o que estudar agora, e por quê. */
export function NextActionCard({ rec }: { rec: Recommendation }) {
  return (
    <Card className="border-brand/40">
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="size-4 text-brand" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
            O que estudar agora
          </span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight">{rec.title}</h2>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <PriorityBadge level={rec.level} />
          <span className="text-muted">
            Prioridade <strong className="font-mono text-fg">{Math.round(rec.priorityScore)}/100</strong>
          </span>
          <span className="text-muted">
            Domínio <MeasureValue measure={rec.domain} format={(v) => formatPercent(v)} className="text-fg" />
          </span>
        </div>

        {rec.reason.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {rec.reason.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-muted">
                <span aria-hidden className="text-ok">✓</span>{r}
              </li>
            ))}
          </ul>
        )}

        <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
          <Link href={rec.href}>{rec.actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
