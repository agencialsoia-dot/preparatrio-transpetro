"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptionList, type OptionItem } from "@/components/questions/option-list";
import { ExamTimer } from "./exam-timer";
import { salvarResposta, finalizarSimulado } from "../actions";
import { cn } from "@/lib/utils";
import type { Letter } from "@/lib/types/database";
import type { RunnerQuestion } from "@/lib/db/simulados";

export function RunnerClient({
  simuladoId,
  startedAt,
  questions,
}: {
  simuladoId: string;
  startedAt: string;
  questions: RunnerQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, Letter>>(() => {
    const init: Record<string, Letter> = {};
    for (const q of questions) if (q.selected_answer) init[q.question_id] = q.selected_answer;
    return init;
  });
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishing, startFinish] = useTransition();

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  const options: OptionItem[] = useMemo(() => {
    const o: OptionItem[] = [
      { letter: "A", text: q.option_a },
      { letter: "B", text: q.option_b },
      { letter: "C", text: q.option_c },
      { letter: "D", text: q.option_d },
    ];
    if (q.option_e) o.push({ letter: "E", text: q.option_e });
    return o;
  }, [q]);

  async function pick(letter: Letter) {
    setAnswers((prev) => ({ ...prev, [q.question_id]: letter }));
    setSaving(true);
    await salvarResposta(simuladoId, q.question_id, letter);
    setSaving(false);
  }

  const go = (i: number) => setCurrent(Math.max(0, Math.min(questions.length - 1, i)));

  return (
    <div className="flex flex-col gap-5">
      {/* topo: progresso + cronometro */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            Questão {String(q.question_number).padStart(2, "0")} / {questions.length}
          </span>
          {saving && <Loader2 className="size-3.5 animate-spin text-muted" />}
        </div>
        <ExamTimer startedAt={startedAt} />
      </div>

      {/* grade de navegacao */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((item, i) => {
          const isAnswered = !!answers[item.question_id];
          const isCurrent = i === current;
          return (
            <button
              key={item.seq_id}
              onClick={() => go(i)}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "size-8 rounded-md text-xs font-medium tabular-nums transition-colors",
                isCurrent && "ring-2 ring-brand ring-offset-1",
                isAnswered ? "bg-brand text-brand-fg" : "bg-bg text-muted hover:bg-border",
              )}
            >
              {item.question_number}
            </button>
          );
        })}
      </div>

      {/* questao */}
      <div className="rounded-[--radius-card] border border-border bg-surface p-5">
        <Badge variant="neutral" className="mb-3 uppercase tracking-wide">
          {q.discipline_name}
        </Badge>
        <p className="enunciado mb-5">{q.statement}</p>
        <OptionList options={options} selected={answers[q.question_id] ?? null} onSelect={pick} />
      </div>

      {/* navegacao inferior */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => go(current - 1)} disabled={current === 0}>
          <ChevronLeft /> Anterior
        </Button>
        <span className="text-xs text-muted">{answeredCount} respondidas</span>
        {current < questions.length - 1 ? (
          <Button onClick={() => go(current + 1)}>
            Próxima <ChevronRight />
          </Button>
        ) : (
          <Button
            variant="default"
            disabled={finishing}
            onClick={() => {
              if (confirm(`Finalizar o simulado? Você respondeu ${answeredCount} de ${questions.length} questões.`)) {
                startFinish(() => finalizarSimulado(simuladoId));
              }
            }}
          >
            {finishing ? <Loader2 className="animate-spin" /> : null} Finalizar
          </Button>
        )}
      </div>
    </div>
  );
}
