"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/stats/status-pill";
import { Progress } from "@/components/ui/progress";
import { computeStatus } from "@/lib/domain/status";
import { formatPercent } from "@/lib/utils";

export interface EditalNodeData {
  id: string;
  name: string;
  code: string | null;
  answered: number;
  correct: number;
  questions: number;
  children: EditalNodeData[];
}
export interface EditalDisciplineData {
  id: string;
  name: string;
  answered: number;
  correct: number;
  roots: EditalNodeData[];
}

function pct(c: number, a: number) {
  return a ? Math.round((c / a) * 1000) / 10 : 0;
}

function Leaf({ node }: { node: EditalNodeData }) {
  const p = pct(node.correct, node.answered);
  const status = computeStatus(node.answered, p);
  return (
    <Link
      href={`/edital/${node.id}`}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-brand-soft"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{node.name}</div>
        <div className="mt-0.5 text-xs text-muted">
          {node.answered > 0 ? (
            <>
              {node.correct}/{node.answered} · {formatPercent(p)}
            </>
          ) : (
            <>{node.questions} questões · sem tentativas</>
          )}
        </div>
      </div>
      <StatusPill status={status} className="shrink-0" />
    </Link>
  );
}

function Group({ node }: { node: EditalNodeData }) {
  const [open, setOpen] = useState(true);
  const p = pct(node.correct, node.answered);
  const status = computeStatus(node.answered, p);
  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 font-medium">
          {open ? <ChevronDown className="size-4 text-muted" /> : <ChevronRight className="size-4 text-muted" />}
          {node.name}
        </span>
        <StatusPill status={status} />
      </button>
      {open && (
        <div className="border-t border-border p-1.5">
          {node.children.map((c) => (c.children.length ? <Group key={c.id} node={c} /> : <Leaf key={c.id} node={c} />))}
        </div>
      )}
    </div>
  );
}

export function EditalTree({ disciplines }: { disciplines: EditalDisciplineData[] }) {
  return (
    <div className="flex flex-col gap-6">
      {disciplines.map((d) => {
        const p = pct(d.correct, d.answered);
        return (
          <section key={d.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{d.name}</h2>
              <span className="font-mono text-sm text-muted">{d.answered ? formatPercent(p) : "—"}</span>
            </div>
            <Progress value={p} tone={p >= 70 ? "ok" : p < 50 && d.answered ? "err" : "brand"} className="mb-3" />
            <div className="flex flex-col gap-1.5">
              {d.roots.map((n) => (n.children.length ? <Group key={n.id} node={n} /> : <Leaf key={n.id} node={n} />))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
