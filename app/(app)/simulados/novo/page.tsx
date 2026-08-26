import { PageHeader } from "@/components/layout/page-header";
import { listExams } from "@/lib/db/exams";
import { listDisciplines, listTopics } from "@/lib/db/disciplines";
import { NovoSimulado } from "./novo-simulado";

export const dynamic = "force-dynamic";

export default async function NovoSimuladoPage() {
  const [exams, disciplines, topics] = await Promise.all([listExams(), listDisciplines(), listTopics()]);
  const exam = exams.find((e) => e.is_real_exam) ?? exams[0];
  return (
    <div>
      <PageHeader title="Simulado personalizado" subtitle="Monte um simulado por disciplina ou tópico." />
      {exam ? (
        <NovoSimulado
          examId={exam.id}
          disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))}
          topics={topics.map((t) => ({ id: t.id, name: t.name, disciplineId: t.discipline_id }))}
        />
      ) : (
        <p className="text-sm text-muted">Nenhuma prova disponível.</p>
      )}
    </div>
  );
}
