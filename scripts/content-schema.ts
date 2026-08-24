import { z } from "zod";

/**
 * Formato de importacao de provas (ver docs/CONTENT_SCHEMA.md).
 *
 * Regra do projeto: campo sem informacao confiavel fica ausente/null. O
 * importador NUNCA preenche topico, dificuldade ou explicacao por conta propria.
 */

const letter = z.enum(["A", "B", "C", "D", "E"]);

export const examMetaSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  organization: z.string().nullish(),
  bank: z.string().nullish(),
  year: z.number().int().nullish(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  total_questions: z.number().int().positive().nullish(),
  is_real_exam: z.boolean().default(true),
});

export const questionSchema = z.object({
  question_number: z.number().int().positive(),
  discipline: z.string().min(1),
  topic: z.string().nullish(),
  statement: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
    E: z.string().nullish(),
  }),
  correct_answer: letter,
  explanation: z.string().nullish(),
  explanation_source: z.enum(["oficial", "ia"]).nullish(),
  source: z.string().nullish(),
  year: z.number().int().nullish(),
  bank: z.string().nullish(),
  difficulty: z.number().int().min(1).max(5).nullish(),
});

export const importFileSchema = z.object({
  exam: examMetaSchema,
  questions: z.array(questionSchema).min(1),
});

export type ImportFile = z.infer<typeof importFileSchema>;
export type ImportQuestion = z.infer<typeof questionSchema>;

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

/**
 * Checagens de coerencia que o schema sozinho nao cobre.
 * Erros abortam a importacao; avisos apenas aparecem no relatorio.
 */
export function validateConsistency(file: ImportFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Numeros de questao duplicados.
  const seen = new Map<number, number>();
  for (const q of file.questions) {
    seen.set(q.question_number, (seen.get(q.question_number) ?? 0) + 1);
  }
  for (const [num, count] of seen) {
    if (count > 1) {
      issues.push({ level: "error", message: `question_number ${num} aparece ${count} vezes.` });
    }
  }

  // 2. Gabarito apontando para alternativa inexistente.
  for (const q of file.questions) {
    if (q.correct_answer === "E" && !q.options.E) {
      issues.push({
        level: "error",
        message: `Questao ${q.question_number}: correct_answer = "E" mas a alternativa E nao existe.`,
      });
    }
  }

  // 3. Explicacao gerada por IA precisa estar rotulada.
  for (const q of file.questions) {
    if (q.explanation && !q.explanation_source) {
      issues.push({
        level: "warning",
        message:
          `Questao ${q.question_number}: tem explicacao sem explanation_source. ` +
          `Use "oficial" ou "ia" — explicacoes de IA sao rotuladas na interface.`,
      });
    }
  }

  // 4. Contagem declarada x contagem real.
  const declared = file.exam.total_questions;
  if (declared && declared !== file.questions.length) {
    issues.push({
      level: "warning",
      message: `A prova declara ${declared} questoes, mas o arquivo traz ${file.questions.length}.`,
    });
  }

  return issues;
}
