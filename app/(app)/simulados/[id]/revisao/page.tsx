import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSimulado, getGradableQuestions } from "@/lib/db/simulados";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptionList } from "@/components/questions/option-list";
import { ExplanationPanel } from "@/components/questions/explanation-panel";
import { Button } from "@/components/ui/button";
import type { Letter } from "@/lib/types/database";

export default async function RevisaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const sim = await getSimulado(id);
  if (!sim) notFound();
  if (sim.status !== "finalizado") redirect(`/simulados/${id}`);

  const graded = await getGradableQuestions(id);
  const letters: Letter[] = ["A", "B", "C", "D", "E"];

  // ?q=N abre uma questao especifica; sem q, mostra todas.
  const only = q ? graded.filter((g) => g.question_order === Number(q)) : graded;
  const list = only.length ? only : graded;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Revisão</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/simulados/${id}/resultado`}>Voltar ao resultado</Link>
        </Button>
      </div>

      {list.map((g) => {
        const acertou = g.selected_answer != null && g.selected_answer === g.correct_answer;
        const options = letters
          .filter((l) => g.options[l])
          .map((l) => ({ letter: l, text: g.options[l] as string }));
        return (
          <Card key={g.question_id}>
            <CardContent className="pt-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  Questão {String(g.question_number).padStart(2, "0")}
                </span>
                <Badge variant="neutral">{g.discipline_name}</Badge>
                {g.topic_name && <Badge variant="neutral">{g.topic_name}</Badge>}
                {acertou ? (
                  <Badge variant="ok">✓ Você acertou</Badge>
                ) : (
                  <Badge variant="err">✗ Você errou</Badge>
                )}
              </div>

              <p className="enunciado mb-4">{g.statement}</p>
              {g.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={g.image_url} alt={`Figura da questão ${g.question_number}`} className="mb-4 max-w-full rounded-lg border border-border bg-white" />
              )}
              <OptionList
                options={options}
                selected={g.selected_answer}
                correct={g.correct_answer}
                reveal
                disabled
              />

              <p className="mt-3 text-sm text-muted">
                Você respondeu <strong className="text-fg">{g.selected_answer ?? "— (em branco)"}</strong>
                {" · "}Resposta correta <strong className="text-ok">{g.correct_answer}</strong>
              </p>

              <div className="mt-3">
                <ExplanationPanel explanation={g.explanation} source={g.explanation_source} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
