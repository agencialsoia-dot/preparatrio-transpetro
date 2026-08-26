"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STUDY_SIZES, type StudySize } from "@/lib/domain/filters";

type Opt = { id: string; name: string };
type TopicOpt = { id: string; name: string; disciplineId: string };

const STATUS: Opt[] = [
  { id: "todas", name: "Todas" },
  { id: "novas", name: "Não respondidas" },
  { id: "respondidas", name: "Já respondidas" },
  { id: "erradas", name: "Erradas" },
];

export function QuestoesFilter({
  disciplines,
  topics,
  banks,
  years,
}: {
  disciplines: Opt[];
  topics: TopicOpt[];
  banks: string[];
  years: number[];
}) {
  const router = useRouter();
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [bank, setBank] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("todas");
  const [size, setSize] = useState<StudySize>(10);

  const topicOptions = useMemo(
    () => topics.filter((t) => !disciplineId || t.disciplineId === disciplineId),
    [topics, disciplineId],
  );

  function start() {
    const sp = new URLSearchParams();
    sp.set("origem", "questoes");
    if (disciplineId) sp.set("disciplina", disciplineId);
    if (topicId) sp.set("topico", topicId);
    if (bank) sp.set("banca", bank);
    if (year) sp.set("ano", year);
    sp.set("modo", status);
    sp.set("quantidade", String(size));
    router.push(`/estudar/sessao?${sp.toString()}`);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <Field label="Disciplina">
          <Chips
            options={[{ id: "", name: "Todas" }, ...disciplines]}
            value={disciplineId}
            onChange={(v) => { setDisciplineId(v); setTopicId(""); }}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Tópico" value={topicId} onChange={setTopicId}
            options={[{ id: "", name: "Todos" }, ...topicOptions.map((t) => ({ id: t.id, name: t.name }))]} />
          <Select label="Banca" value={bank} onChange={setBank}
            options={[{ id: "", name: "Todas" }, ...banks.map((b) => ({ id: b, name: b }))]} />
          <Select label="Ano" value={year} onChange={setYear}
            options={[{ id: "", name: "Todos" }, ...years.map((y) => ({ id: String(y), name: String(y) }))]} />
          <Select label="Situação" value={status} onChange={setStatus} options={STATUS} />
        </div>

        <Field label="Quantidade">
          <Chips options={STUDY_SIZES.map((s) => ({ id: String(s), name: String(s) }))}
            value={String(size)} onChange={(v) => setSize(Number(v) as StudySize)} />
        </Field>

        <Button size="lg" onClick={start}>Resolver questões</Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-sm font-medium">{label}</p>{children}</div>;
}

function Chips({ options, value, onChange }: { options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cn("rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
            value === o.id ? "border-brand bg-brand text-brand-fg" : "border-border bg-surface hover:bg-brand-soft")}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Opt[] }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-border bg-surface px-2.5 text-sm font-normal">
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}
