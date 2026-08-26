"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { iniciarSimuladoPersonalizado } from "../actions";

type Opt = { id: string; name: string };
type TopicOpt = Opt & { disciplineId: string };
const SIZES = [10, 20, 40, 60];

export function NovoSimulado({ examId, disciplines, topics }: { examId: string; disciplines: Opt[]; topics: TopicOpt[] }) {
  const [disciplineId, setDisciplineId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [size, setSize] = useState(20);
  const [pending, start] = useTransition();

  const topicOptions = useMemo(
    () => topics.filter((t) => !disciplineId || t.disciplineId === disciplineId),
    [topics, disciplineId],
  );

  function submit() {
    const discName = disciplines.find((d) => d.id === disciplineId)?.name;
    const topName = topics.find((t) => t.id === topicId)?.name;
    const title = topName
      ? `Simulado — ${topName}`
      : discName
        ? `Simulado — ${discName}`
        : `Simulado — ${size} questões`;
    start(() =>
      iniciarSimuladoPersonalizado({ examId, title, disciplineId: disciplineId || null, topicId: topicId || null, quantity: size }),
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <Field label="Disciplina">
          <Chips options={[{ id: "", name: "Todas" }, ...disciplines]} value={disciplineId}
            onChange={(v) => { setDisciplineId(v); setTopicId(""); }} />
        </Field>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Tópico (opcional)
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-2.5 text-sm font-normal">
            <option value="">Todos</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <Field label="Quantidade">
          <Chips options={SIZES.map((s) => ({ id: String(s), name: String(s) }))} value={String(size)}
            onChange={(v) => setSize(Number(v))} />
        </Field>
        <Button size="lg" onClick={submit} disabled={pending}>
          {pending ? "Criando…" : "Iniciar simulado"}
        </Button>
        <p className="text-xs text-muted">A distribuição é automática a partir das questões disponíveis no filtro.</p>
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
