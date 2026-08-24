import Link from "next/link";
import { listDisciplines } from "@/lib/db/disciplines";
import { PageHeader } from "@/components/layout/page-header";
import { StudyConfig } from "./study-config";

export default async function EstudarPage() {
  const disciplines = await listDisciplines();
  return (
    <div>
      <PageHeader
        title="Estudar questões"
        subtitle="Correção imediata, questão por questão."
        action={
          <Link href="/erros" className="text-sm font-medium text-brand hover:underline">
            Minhas questões erradas →
          </Link>
        }
      />
      <StudyConfig disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))} />
    </div>
  );
}
