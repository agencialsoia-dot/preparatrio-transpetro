/** Tipos das tabelas do Supabase. Espelham supabase/migrations/*.sql. */

export type Letter = "A" | "B" | "C" | "D" | "E";
export const LETTERS: readonly Letter[] = ["A", "B", "C", "D", "E"] as const;

export type Origin = "simulado" | "estudo";
export type Confidence = "confiante" | "duvida" | "chute";
export type SimuladoStatus = "em_andamento" | "finalizado";

export interface Exam {
  id: string;
  slug: string;
  name: string;
  organization: string | null;
  bank: string | null;
  year: number | null;
  category: string | null;
  description: string | null;
  total_questions: number | null;
  is_real_exam: boolean;
  is_sample: boolean;
  created_at: string;
}

export interface Discipline {
  id: string;
  name: string;
  order_index: number;
}

export interface Topic {
  id: string;
  discipline_id: string;
  parent_id: string | null;
  name: string;
  order_index: number;
  code: string | null;
  description: string | null;
}

export interface Question {
  id: string;
  exam_id: string;
  discipline_id: string;
  topic_id: string | null;
  question_number: number;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  correct_answer: Letter;
  explanation: string | null;
  explanation_source: "oficial" | "ia" | null;
  source: string | null;
  year: number | null;
  bank: string | null;
  difficulty: number | null;
  is_sample: boolean;
  image_url: string | null;
  question_category: QuestionCategory;
  study_unit_id: string | null;
  study_section_id: string | null;
  created_at: string;
}

/**
 * Questao SEM gabarito. E este o formato enviado ao cliente durante o
 * simulado — `correct_answer` e `explanation` nunca saem do servidor antes
 * da finalizacao.
 */
export type QuestionForExam = Omit<
  Question,
  "correct_answer" | "explanation" | "explanation_source"
>;

export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: Letter;
  is_correct: boolean;
  time_spent_seconds: number | null;
  confidence: Confidence | null;
  origin: Origin;
  error_type: ErrorType | null;
  simulated_exam_id: string | null;
  created_at: string;
}

export interface SimulatedExam {
  id: string;
  user_id: string;
  exam_id: string;
  title: string;
  status: SimuladoStatus;
  started_at: string;
  finished_at: string | null;
  total_questions: number;
  correct_answers: number | null;
  wrong_answers: number | null;
  score_percentage: number | null;
  total_time_seconds: number | null;
}

export interface SimulatedExamQuestion {
  id: string;
  simulated_exam_id: string;
  question_id: string;
  question_order: number;
  selected_answer: Letter | null;
  is_correct: boolean | null;
  time_spent_seconds: number | null;
  answered_at: string | null;
}

export type QuestionCategory =
  | "prova_real"
  | "questao_banca"
  | "questao_adaptada"
  | "questao_inedita";

export type ErrorType =
  | "nao_sabia"
  | "confundiu_conceito"
  | "erro_calculo"
  | "erro_interpretacao"
  | "chute"
  | "nao_classificado";

export type SectionType =
  | "concept" | "fundamentals" | "formula" | "example" | "application"
  | "how_to_solve" | "common_mistakes" | "exam_focus" | "summary" | "other";

export type ContentSourceType =
  | "material_oficial" | "material_proprio" | "notebooklm" | "ia" | "outro";

export interface StudyUnit {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  source: string | null;
  source_type: ContentSourceType | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyContentSection {
  id: string;
  study_unit_id: string;
  title: string;
  slug: string;
  content_markdown: string | null;
  section_type: SectionType;
  order_index: number;
  created_at: string;
  updated_at: string;
}
