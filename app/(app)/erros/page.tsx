import Link from "next/link";
import { getWrongQuestions } from "@/lib/db/stats";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ERROR_TYPE_MAP } from "@/lib/domain/errors";
import type { ErrorType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function ErrosPage() {
  const wrong = await getWrongQuestions();
  const recorrentes = wrong.filter((w) => w.recurring);

  return (
    <div>
      <PageHeader
        title="Meus Erros"
        subtitle="Questões cuja última tentativa foi incorreta. Somem quando você acerta no reestudo."
        action={
          wrong.length > 0 ? (
            <Button asChild size="sm">
              <Link href="/estudar/sessao?modo=erradas&quantidade=20&origem=questoes">Reestudar erros</Link>
            </Button>
          ) : undefined
        }
      />

      {wrong.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma questão errada pendente. Faça um simulado ou estude para começar.</p>
      ) : (
        <>
          {recorrentes.length > 0 && (
            <div className="mb-5 rounded-xl border border-err/40 bg-err-soft/50 p-4">
              <p className="text-sm font-semibold text-err">⚠️ Atenção — {recorrentes.length} questão(ões) errada(s) mais de uma vez</p>
              <p className="mt-1 text-xs text-muted">São as que mais pesam no seu diagnóstico. Priorize revisá-las.</p>
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {wrong.map((w) => {
              const et = w.last_error_type ? ERROR_TYPE_MAP[w.last_error_type as ErrorType] : null;
              return (
                <li key={w.question_id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Questão {String(w.question_number).padStart(2, "0")}
                      {w.recurring && <span className="ml-2 text-xs font-semibold text-err">errou {w.times_wrong}×</span>}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{w.discipline_name}</Badge>
                      {w.topic_name && <Badge variant="neutral">{w.topic_name}</Badge>}
                      {et && <span className="text-xs text-muted">{et.dot} {et.label}</span>}
                      <span className="text-xs text-muted">· {formatDate(w.last_wrong_at)}</span>
                    </div>
                  </div>
                  {w.topic_id && (
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link href={`/estudar/sessao?topico=${w.topic_id}&modo=erradas&quantidade=10&origem=questoes`}>Reestudar</Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
