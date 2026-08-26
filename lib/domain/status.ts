/**
 * Status de domínio (tópico E unidade de estudo) — módulo ÚNICO e centralizado.
 *
 * Regra do MVP: baseada em desempenho (acertos/respondidas) + volume mínimo.
 * PROGRESSO (% da trilha percorrida) é conceito separado — nunca confundir com DOMÍNIO.
 */

export type StatusKey =
  | "nao_iniciado"
  | "em_estudo"
  | "em_desenvolvimento"
  | "precisa_revisar"
  | "consolidado";

export interface StatusInfo {
  key: StatusKey;
  label: string;
  /** emoji-farol usado na UI */
  dot: string;
  /** token de cor do design system */
  tone: "muted" | "info" | "warn" | "err" | "ok";
}

export const STATUS: Record<StatusKey, StatusInfo> = {
  nao_iniciado:       { key: "nao_iniciado",       label: "Não iniciado",       dot: "⚪", tone: "muted" },
  em_estudo:          { key: "em_estudo",          label: "Em estudo",          dot: "🔵", tone: "info" },
  em_desenvolvimento: { key: "em_desenvolvimento", label: "Em desenvolvimento", dot: "🟠", tone: "warn" },
  precisa_revisar:    { key: "precisa_revisar",    label: "Precisa revisar",    dot: "🔴", tone: "err" },
  consolidado:        { key: "consolidado",        label: "Consolidado",        dot: "🟢", tone: "ok" },
};

/** Volume mínimo de questões respondidas para o status refletir desempenho. */
export const MIN_ANSWERED_FOR_STATUS = 4;

/**
 * Deriva o status a partir de nº de questões respondidas e do % de acerto.
 * Critérios centralizados aqui para fácil ajuste.
 */
export function computeStatus(answered: number, accuracy: number): StatusInfo {
  if (answered <= 0) return STATUS.nao_iniciado;
  if (answered < MIN_ANSWERED_FOR_STATUS) return STATUS.em_estudo;
  if (accuracy < 50) return STATUS.precisa_revisar;
  if (accuracy < 70) return STATUS.em_desenvolvimento;
  if (accuracy < 85) return STATUS.em_desenvolvimento;
  return STATUS.consolidado;
}

/** Progresso de trilha: nº de etapas concluídas / total. Sempre 0–100. */
export function trailProgress(stepsDone: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const p = Math.round((stepsDone / totalSteps) * 100);
  return Math.max(0, Math.min(100, p));
}
