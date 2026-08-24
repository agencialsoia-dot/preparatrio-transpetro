"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptionList } from "@/components/questions/option-list";
import { ExplanationPanel } from "@/components/questions/explanation-panel";
import { responderEstudo } from "../actions";
import type { StudyQuestion } from "@/lib/db/questions";
import type { Letter } from "@/lib/types/database";

interface Result {
  is_correct: boolean;
  correct_answer: Letter;
  explanation: string | null;
  explanation_source: string | null;
}

export function StudySession({ questions }: { questions: StudyQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [corretas, setCorretas] = useState(0);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  async function answer(letter: Letter) {
    if (result) return; // ja respondida
    setSelected(letter);
    setLoading(true);
    const res = await responderEstudo(q.id, letter);
    setLoading(false);
    if (res.ok) {
      setResult({
        is_correct: !!res.is_correct,
        correct_answer: res.correct_answer as Letter,
        explanation: res.explanation ?? null,
        explanation_source: res.explanation_source ?? null,
      });
      if (res.is_correct) setCorretas((c) => c + 1);
    }
  }

  function next() {
    if (isLast) return;
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  }

  if (index >= questions.length) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          {index + 1} / {questions.length}
        </span>
        <span className="text-muted tabular-nums">{corretas} certas</span>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{q.discipline_name}</Badge>
            {q.topic_name && <Badge variant="neutral">{q.topic_name}</Badge>}
          </div>
          <p className="enunciado mb-5">{q.statement}</p>

          <OptionList
            options={q.options}
            selected={selected}
            correct={result ? result.correct_answer : null}
            reveal={!!result}
            disabled={!!result || loading}
            onSelect={answer}
          />

          {result && (
            <div className="mt-4 flex flex-col gap-3">
              {result.is_correct ? (
                <Badge variant="ok" className="w-fit text-sm">✓ Correto</Badge>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="err" className="text-sm">✗ Incorreto</Badge>
                  <span className="text-sm text-muted">
                    Você respondeu <strong className="text-fg">{selected}</strong> · correta{" "}
                    <strong className="text-ok">{result.correct_answer}</strong>
                  </span>
                </div>
              )}
              <ExplanationPanel explanation={result.explanation} source={result.explanation_source} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {result &&
          (isLast ? (
            <Button asChild>
              <Link href="/estudar">Concluir</Link>
            </Button>
          ) : (
            <Button onClick={next}>Próxima questão</Button>
          ))}
      </div>
    </div>
  );
}
