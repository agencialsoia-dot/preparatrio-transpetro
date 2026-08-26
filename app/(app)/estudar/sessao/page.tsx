import Link from "next/link";
import { parseStudyFilter, selectQuestionIds } from "@/lib/domain/filters";
import { getCandidateQuestionIds, getStudyQuestions } from "@/lib/db/questions";
import { getUserHistory } from "@/lib/db/stats";
import { StudySession } from "./study-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuestionCategory } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function SessaoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter = parseStudyFilter(sp);
  const back = sp.origem === "questoes" ? "/questoes" : sp.topico ? `/edital/${sp.topico}` : "/estudar";

  const [candidateIds, history] = await Promise.all([
    getCandidateQuestionIds({
      disciplineId: filter.disciplineId,
      topicId: filter.topicId,
      bank: sp.banca || null,
      year: sp.ano ? Number(sp.ano) : null,
      difficulty: sp.dificuldade ? Number(sp.dificuldade) : null,
      category: (sp.categoria as QuestionCategory) || null,
    }),
    getUserHistory(),
  ]);

  const ids = selectQuestionIds(candidateIds, history, filter.mode, filter.size);
  const questions = await getStudyQuestions(ids);

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted">Nenhuma questão encontrada para esse filtro. Tente outro modo ou disciplina.</p>
          <Button variant="outline" asChild><Link href={back}>Voltar</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return <StudySession questions={questions} backHref={back} />;
}
