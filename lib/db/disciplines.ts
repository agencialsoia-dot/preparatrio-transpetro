import { createClient } from "@/lib/supabase/server";
import type { Discipline, Topic } from "@/lib/types/database";

export async function listDisciplines(): Promise<Discipline[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("disciplines").select("*").order("order_index");
  return data ?? [];
}

export async function listTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("topics").select("*").order("order_index");
  return data ?? [];
}
