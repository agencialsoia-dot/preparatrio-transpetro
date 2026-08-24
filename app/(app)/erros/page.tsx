import Link from "next/link";
import { getWrongQuestions } from "@/lib/db/stats";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ErrosPage() {
  const wrong = await getWrongQuestions();

  return (
    <div>
      <PageHeader
        title="Minhas questões erradas"
        subtitle="Some da lista quando você acerta no reestudo."
        action={
          wrong.length > 0 ? (
            <Button asChild size="sm">
              <Link href="/estudar/sessao?modo=erradas&quantidade=20">Reestudar erros</Link>
            </Button>
          ) : undefined
        }
      />
      {wrong.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma questão errada pendente. Faça um simulado ou estude questões para começar.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {wrong.map((w) => (
            <li
              key={w.question_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  Questão {String(w.question_number).padStart(2, "0")}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="neutral">{w.discipline_name}</Badge>
                  {w.topic_name && <Badge variant="neutral">{w.topic_name}</Badge>}
                  <span className="text-xs text-muted">Último erro: {formatDate(w.last_wrong_at)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
