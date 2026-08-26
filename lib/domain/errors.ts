import type { ErrorType } from "@/lib/types/database";
import type { SectionType } from "@/lib/types/database";

export interface ErrorTypeInfo {
  key: ErrorType;
  label: string;
  dot: string;
  /** seção de teoria recomendada quando o erro é deste tipo (§32) */
  recommends: SectionType | null;
}

export const ERROR_TYPES: ErrorTypeInfo[] = [
  { key: "nao_sabia",         label: "Não sabia o conteúdo", dot: "🔴", recommends: "fundamentals" },
  { key: "confundiu_conceito", label: "Confundi o conceito",  dot: "🟠", recommends: "concept" },
  { key: "erro_calculo",      label: "Errei o cálculo",      dot: "🟡", recommends: "formula" },
  { key: "erro_interpretacao", label: "Errei a interpretação", dot: "🔵", recommends: "example" },
  { key: "chute",             label: "Chutei",               dot: "⚪", recommends: null },
  { key: "nao_classificado",  label: "Não classificar",      dot: "⚫", recommends: null },
];

export const ERROR_TYPE_MAP: Record<ErrorType, ErrorTypeInfo> = Object.fromEntries(
  ERROR_TYPES.map((e) => [e.key, e]),
) as Record<ErrorType, ErrorTypeInfo>;

export function isErrorType(v: unknown): v is ErrorType {
  return typeof v === "string" && v in ERROR_TYPE_MAP;
}
