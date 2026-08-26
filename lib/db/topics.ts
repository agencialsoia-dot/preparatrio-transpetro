import { createClient } from "@/lib/supabase/server";
import type { Discipline, Topic } from "@/lib/types/database";

export interface TopicStat {
  topic_id: string;
  answered: number;
  correct: number;
}

/** Estatística por tópico do usuário (join attempts → question.topic). */
export async function getTopicStats(): Promise<Map<string, TopicStat>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_attempts")
    .select("is_correct, questions(topic_id)");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const map = new Map<string, TopicStat>();
  for (const r of (data ?? []) as any[]) {
    const tid = r.questions?.topic_id;
    if (!tid) continue;
    const s = map.get(tid) ?? { topic_id: tid, answered: 0, correct: 0 };
    s.answered += 1;
    if (r.is_correct) s.correct += 1;
    map.set(tid, s);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return map;
}

/** Nº de questões por tópico (cadastradas), para mostrar volume disponível. */
export async function getTopicQuestionCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("questions").select("topic_id").eq("is_sample", false);
  const map = new Map<string, number>();
  for (const r of data ?? []) {
    if (!r.topic_id) continue;
    map.set(r.topic_id, (map.get(r.topic_id) ?? 0) + 1);
  }
  return map;
}

export interface DisciplineTree {
  discipline: Discipline;
  roots: TopicNode[];
}
export interface TopicNode {
  topic: Topic;
  children: TopicNode[];
}

/** Árvore disciplina → tópicos (pais → folhas). */
export async function getEditalTree(): Promise<DisciplineTree[]> {
  const supabase = await createClient();
  const [{ data: disc }, { data: tops }] = await Promise.all([
    supabase.from("disciplines").select("*").order("order_index"),
    supabase.from("topics").select("*").order("order_index"),
  ]);
  const topics = (tops ?? []) as Topic[];
  return (disc ?? []).map((d) => {
    const mine = topics.filter((t) => t.discipline_id === d.id);
    const byParent = new Map<string | null, Topic[]>();
    for (const t of mine) {
      const k = t.parent_id;
      byParent.set(k, [...(byParent.get(k) ?? []), t]);
    }
    const build = (parent: string | null): TopicNode[] =>
      (byParent.get(parent) ?? []).map((t) => ({ topic: t, children: build(t.id) }));
    return { discipline: d, roots: build(null) };
  });
}

export async function getTopicById(id: string): Promise<Topic | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("topics").select("*").eq("id", id).maybeSingle();
  return data;
}
