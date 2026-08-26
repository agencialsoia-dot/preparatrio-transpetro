import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { listDisciplines, listTopics } from "@/lib/db/disciplines";
import { QuestoesFilter } from "./questoes-filter";

export const dynamic = "force-dynamic";

export default async function QuestoesPage() {
  const supabase = await createClient();
  const [disciplines, topics, { data: meta }] = await Promise.all([
    listDisciplines(),
    listTopics(),
    supabase.from("questions").select("bank, year").eq("is_sample", false),
  ]);
  const banks = [...new Set((meta ?? []).map((m) => m.bank).filter(Boolean))] as string[];
  const years = [...new Set((meta ?? []).map((m) => m.year).filter(Boolean))].sort((a, b) => (b as number) - (a as number)) as number[];

  return (
    <div>
      <PageHeader title="Banco de Questões" subtitle="Filtre e resolva. Correção imediata e classificação do erro." />
      <QuestoesFilter
        disciplines={disciplines.map((d) => ({ id: d.id, name: d.name }))}
        topics={topics.map((t) => ({ id: t.id, name: t.name, disciplineId: t.discipline_id }))}
        banks={banks}
        years={years}
      />
    </div>
  );
}
