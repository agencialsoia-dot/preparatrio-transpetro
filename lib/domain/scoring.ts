import type { Letter } from "@/lib/types/database";

/** Questao com o gabarito — usada apenas apos a finalizacao do simulado. */
export interface GradableQuestion {
  question_id: string;
  question_number: number;
  question_order: number;
  discipline_id: string;
  discipline_name: string;
  topic_id: string | null;
  topic_name: string | null;
  correct_answer: Letter;
  selected_answer: Letter | null;
}

export interface DisciplineScore {
  discipline_id: string;
  discipline_name: string;
  total: number;
  correct: number;
  wrong: number;
  blank: number;
  percentage: number;
}

export interface SimuladoScore {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  /** Percentual sobre o TOTAL de questoes (em branco conta como erro). */
  percentage: number;
  byDiscipline: DisciplineScore[];
  wrongQuestions: GradableQuestion[];
}

/** Percentual 0–100 com 1 casa decimal. Divisao por zero devolve 0. */
export function percent(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * Corrige um simulado inteiro.
 *
 * Questoes em branco contam como erro no percentual geral — e assim que a
 * prova real pontua, e e o numero que interessa como diagnostico.
 */
export function scoreSimulado(questions: readonly GradableQuestion[]): SimuladoScore {
  const byDisciplineMap = new Map<string, DisciplineScore>();
  const wrongQuestions: GradableQuestion[] = [];
  let correct = 0;
  let blank = 0;

  for (const q of questions) {
    let bucket = byDisciplineMap.get(q.discipline_id);
    if (!bucket) {
      bucket = {
        discipline_id: q.discipline_id,
        discipline_name: q.discipline_name,
        total: 0,
        correct: 0,
        wrong: 0,
        blank: 0,
        percentage: 0,
      };
      byDisciplineMap.set(q.discipline_id, bucket);
    }
    bucket.total += 1;

    if (q.selected_answer == null) {
      blank += 1;
      bucket.blank += 1;
      wrongQuestions.push(q);
    } else if (q.selected_answer === q.correct_answer) {
      correct += 1;
      bucket.correct += 1;
    } else {
      bucket.wrong += 1;
      wrongQuestions.push(q);
    }
  }

  const byDiscipline = [...byDisciplineMap.values()].map((d) => ({
    ...d,
    percentage: percent(d.correct, d.total),
  }));

  const total = questions.length;
  return {
    total,
    answered: total - blank,
    correct,
    wrong: total - correct - blank,
    blank,
    percentage: percent(correct, total),
    byDiscipline,
    wrongQuestions: wrongQuestions.sort((a, b) => a.question_order - b.question_order),
  };
}

/** True se a alternativa marcada corresponde ao gabarito. */
export function isCorrect(selected: Letter | null, correct: Letter): boolean {
  return selected !== null && selected === correct;
}
