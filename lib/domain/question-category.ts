import type { QuestionCategory } from "@/lib/types/database";

export interface CategoryInfo {
  key: QuestionCategory;
  label: string;
  /** rótulo curto para badge (nunca misturar categorias visualmente, §14) */
  short: string;
  tone: "ok" | "info" | "warn" | "muted";
}

export const CATEGORIES: Record<QuestionCategory, CategoryInfo> = {
  prova_real:      { key: "prova_real",      label: "Prova real",      short: "PROVA REAL", tone: "ok" },
  questao_banca:   { key: "questao_banca",   label: "Questão de banca", short: "BANCA",      tone: "info" },
  questao_adaptada:{ key: "questao_adaptada", label: "Questão adaptada", short: "ADAPTADA",   tone: "warn" },
  questao_inedita: { key: "questao_inedita", label: "Questão inédita",  short: "INÉDITA",    tone: "muted" },
};
