import { percent } from "./scoring.ts";

/** Linha crua vinda de question_attempts, com os nomes ja resolvidos. */
export interface AttemptRow {
  question_id: string;
  is_correct: boolean;
  created_at: string;
  discipline_id: string;
  discipline_name: string;
  topic_id: string | null;
  topic_name: string | null;
  bank?: string | null;
  origin?: "simulado" | "estudo";
}

export interface GroupStat {
  id: string;
  name: string;
  answered: number;
  correct: number;
  percentage: number;
}

export interface OverallStats {
  answered: number;
  correct: number;
  wrong: number;
  percentage: number;
  /** Questoes distintas que o usuario ja viu ao menos uma vez. */
  uniqueQuestions: number;
}

/**
 * Desempenho geral.
 *
 * Metrica do MVP, deliberadamente simples: acertos / respondidas, contando
 * TODAS as tentativas (nao apenas a ultima). Refazer uma questao e acertar
 * melhora o percentual — que e exatamente o comportamento desejado num ciclo
 * de "errar, estudar, refazer".
 */
export function overallStats(rows: readonly AttemptRow[]): OverallStats {
  const correct = rows.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
  return {
    answered: rows.length,
    correct,
    wrong: rows.length - correct,
    percentage: percent(correct, rows.length),
    uniqueQuestions: new Set(rows.map((r) => r.question_id)).size,
  };
}

function groupBy(
  rows: readonly AttemptRow[],
  keyOf: (r: AttemptRow) => string | null,
  nameOf: (r: AttemptRow) => string | null,
): GroupStat[] {
  const map = new Map<string, GroupStat>();
  for (const r of rows) {
    const id = keyOf(r);
    if (id == null) continue; // questoes sem topico ficam de fora do recorte
    let g = map.get(id);
    if (!g) {
      g = { id, name: nameOf(r) ?? "—", answered: 0, correct: 0, percentage: 0 };
      map.set(id, g);
    }
    g.answered += 1;
    if (r.is_correct) g.correct += 1;
  }
  return [...map.values()]
    .map((g) => ({ ...g, percentage: percent(g.correct, g.answered) }))
    .sort((a, b) => a.percentage - b.percentage); // pior primeiro: e onde estudar
}

export function statsByDiscipline(rows: readonly AttemptRow[]): GroupStat[] {
  return groupBy(rows, (r) => r.discipline_id, (r) => r.discipline_name);
}

export function statsByTopic(rows: readonly AttemptRow[]): GroupStat[] {
  return groupBy(rows, (r) => r.topic_id, (r) => r.topic_name);
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  answered: number;
  correct: number;
  percentage: number;
}

/** Serie diaria para acompanhar evolucao. Ordenada da mais antiga para a mais nova. */
export function dailySeries(rows: readonly AttemptRow[]): DailyPoint[] {
  const map = new Map<string, { answered: number; correct: number }>();
  for (const r of rows) {
    const date = r.created_at.slice(0, 10);
    const d = map.get(date) ?? { answered: 0, correct: 0 };
    d.answered += 1;
    if (r.is_correct) d.correct += 1;
    map.set(date, d);
  }
  return [...map.entries()]
    .map(([date, d]) => ({ date, ...d, percentage: percent(d.correct, d.answered) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Desempenho por banca (Cesgranrio, etc.). Ignora tentativas sem banca. */
export function statsByBank(rows: readonly AttemptRow[]): GroupStat[] {
  return groupBy(rows, (r) => r.bank ?? null, (r) => r.bank ?? null);
}

/** Desempenho por origem da tentativa (simulado × estudo). */
export function statsByOrigin(rows: readonly AttemptRow[]): GroupStat[] {
  return groupBy(rows, (r) => r.origin ?? null, (r) => {
    if (r.origin === "simulado") return "Simulados";
    if (r.origin === "estudo") return "Estudo";
    return null;
  });
}

export interface StrongWeak {
  strong: GroupStat[];
  weak: GroupStat[];
}

/**
 * Pontos fortes/fracos por disciplina — top e bottom por %, exigindo um mínimo
 * de tentativas para não destacar amostras irrelevantes.
 */
export function strongWeakDisciplines(
  rows: readonly AttemptRow[],
  minAnswered = 4,
  n = 3,
): StrongWeak {
  const eligible = statsByDiscipline(rows).filter((g) => g.answered >= minAnswered);
  const byPct = [...eligible].sort((a, b) => b.percentage - a.percentage);
  return { strong: byPct.slice(0, n), weak: [...byPct].reverse().slice(0, n) };
}
