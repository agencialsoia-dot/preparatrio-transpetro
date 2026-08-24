import { notFound, redirect } from "next/navigation";
import { getSimulado, getRunnerQuestions } from "@/lib/db/simulados";
import { RunnerClient } from "./runner-client";

export default async function RunnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sim = await getSimulado(id);
  if (!sim) notFound();
  if (sim.status === "finalizado") redirect(`/simulados/${id}/resultado`);

  const questions = await getRunnerQuestions(id);
  if (questions.length === 0) notFound();

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold">{sim.title}</h1>
      <p className="mb-5 text-sm text-muted">Modo simulado · sem correção até o final.</p>
      <RunnerClient simuladoId={id} startedAt={sim.started_at} questions={questions} />
    </div>
  );
}
