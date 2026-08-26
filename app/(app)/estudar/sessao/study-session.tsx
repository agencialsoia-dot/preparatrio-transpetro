"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptionList } from "@/components/questions/option-list";
import { ExplanationPanel } from "@/components/questions/explanation-panel";
import { ErrorClassifier } from "@/components/questions/error-classifier";
import { CATEGORIES } from "@/lib/domain/question-category";
import { responderEstudo, classificarErro } from "../actions";
import type { StudyQuestion } from "@/lib/db/questions";
import type { Letter, ErrorType } from "@/lib/types/database";

interface Result {
  attempt_id: string;
  is_correct: boolean;
  correct_answer: Letter;
  explanation: string | null;
  explanation_source: string | null;
}

export function StudySession({ questions, backHref = "/estudar" }: { questions: StudyQuestion[]; backHref?: string }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [classified, setClassified] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState(false);
  const [corretas, setCorretas] = useState(0);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  async function answer(letter: Letter) {
    if (result) return;
    setSelected(letter);
    setLoading(true);
    const res = await responderEstudo(q.id, letter);
    setLoading(false);
    if (res.ok && res.attempt_id) {
      setResult({
        attempt_id: res.attempt_id,
        is_correct: !!res.is_correct,
        correct_answer: res.correct_answer as Letter,
        explanation: res.explanation ?? null,
        explanation_source: res.explanation_source ?? null,
      });
      if (res.is_correct) setCorretas((c) => c + 1);
    }
  }

  async function classify(type: ErrorType) {
    if (!result) return;
    setClassified(type);
    await classificarErro(result.attempt_id, type);
  }

  function next() {
    if (isLast) return;
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
    setClassified(null);
  }

  if (index >= questions.length) return null;
  const cat = CATEGORIES[q.category];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{index + 1} / {questions.length}</span>
        <span className="tabular-nums text-muted">{corretas} certas</span>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={cat.tone === "ok" ? "ok" : "neutral"}>{cat.short}</Badge>
            <Badge variant="neutral">{q.discipline_name}</Badge>
            {q.topic_name && <Badge variant="neutral">{q.topic_name}</Badge>}
            <span className="ml-auto font-mono text-xs text-muted">
              {q.exam_name ? `${q.exam_name}` : ""} {q.bank ? `· ${q.bank}` : ""} {q.year ? `· ${q.year}` : ""}
            </span>
          </div>
          <p className="enunciado mb-4">{q.statement}</p>

          {q.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={q.image_url}
              alt={`Figura da questão ${q.question_number}`}
              className="mb-5 max-w-full rounded-lg border border-border bg-white"
            />
          )}

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
              {!result.is_correct && (
                <ErrorClassifier value={classified} onSelect={classify} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {result &&
          (isLast ? (
            <Button asChild><Link href={backHref}>Concluir</Link></Button>
          ) : (
            <Button onClick={next}>Próxima questão</Button>
          ))}
      </div>
    </div>
  );
}
