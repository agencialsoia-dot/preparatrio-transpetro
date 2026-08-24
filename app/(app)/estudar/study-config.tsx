"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  STUDY_MODES,
  STUDY_MODE_LABELS,
  STUDY_SIZES,
  type StudyMode,
  type StudySize,
} from "@/lib/domain/filters";

export function StudyConfig({ disciplines }: { disciplines: { id: string; name: string }[] }) {
  const router = useRouter();
  const [disciplineId, setDisciplineId] = useState<string | null>(null);
  const [mode, setMode] = useState<StudyMode>("todas");
  const [size, setSize] = useState<StudySize>(10);

  function start() {
    const sp = new URLSearchParams();
    if (disciplineId) sp.set("disciplina", disciplineId);
    sp.set("modo", mode);
    sp.set("quantidade", String(size));
    router.push(`/estudar/sessao?${sp.toString()}`);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <Field label="Disciplina">
          <Chips
            options={[{ id: "", name: "Todas" }, ...disciplines]}
            value={disciplineId ?? ""}
            onChange={(v) => setDisciplineId(v || null)}
          />
        </Field>

        <Field label="Modo">
          <Chips
            options={STUDY_MODES.map((m) => ({ id: m, name: STUDY_MODE_LABELS[m] }))}
            value={mode}
            onChange={(v) => setMode(v as StudyMode)}
          />
        </Field>

        <Field label="Quantidade">
          <Chips
            options={STUDY_SIZES.map((s) => ({ id: String(s), name: String(s) }))}
            value={String(size)}
            onChange={(v) => setSize(Number(v) as StudySize)}
          />
        </Field>

        <Button size="lg" onClick={start}>
          Começar
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === o.id
              ? "border-brand bg-brand text-brand-fg"
              : "border-border bg-surface text-muted hover:bg-brand-soft",
          )}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}
