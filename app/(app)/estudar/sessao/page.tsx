import Link from "next/link";
import { parseStudyFilter, selectQuestionIds } from "@/lib/domain/filters";
import { getCandidateQuestionIds, getStudyQuestions } from "@/lib/db/questions";
import { getUserHistory } from "@/lib/db/stats";
import { StudySession } from "./study-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SessaoPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string; topico?: string; modo?: string; quantidade?: string }>;
}) {
  const sp = await searchParams;
  const filter = parseStudyFilter(sp);

  const [candidateIds, history] = await Promise.all([
    getCandidateQuestionIds({ disciplineId: filter.disciplineId, topicId: filter.topicId }),
    getUserHistory(),
  ]);

  const ids = selectQuestionIds(candidateIds, history, filter.mode, filter.size);
  const questions = await getStudyQuestions(ids);

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-muted">
            Nenhuma questão encontrada para esse filtro. Tente outro modo ou disciplina.
          </p>
          <Button variant="outline" asChild>
            <Link href="/estudar">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <StudySession questions={questions} />;
}
