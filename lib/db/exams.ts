import { createClient } from "@/lib/supabase/server";
import type { Exam } from "@/lib/types/database";

/** Provas reais disponiveis (com selo), mais recentes primeiro. */
export async function listExams(): Promise<Exam[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select("*")
    .order("is_sample", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("exams").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getExamById(id: string): Promise<Exam | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("exams").select("*").eq("id", id).maybeSingle();
  return data;
}

/** Quantas questoes ja foram importadas para uma prova. */
export async function countExamQuestions(examId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);
  return count ?? 0;
}
