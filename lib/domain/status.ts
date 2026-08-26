/**
 * Status de domínio (tópico E unidade de estudo) — módulo ÚNICO e centralizado.
 *
 * Baseado em desempenho (acertos/respondidas) + volume mínimo.
 * PROGRESSO (% da trilha) é conceito separado — ver `trail.ts`. Nunca confundir:
 * concluir a teoria não significa dominar o assunto.
 */

export type StatusKey =
  | "nao_iniciado"
  | "em_estudo"
  | "precisa_revisar"
  | "em_desenvolvimento"
  | "bom"
  | "consolidado";

export interface StatusInfo {
  key: StatusKey;
  label: string;
  /** farol — sempre acompanhado do label; cor nunca carrega a informação sozinha */
  dot: string;
  tone: "muted" | "info" | "warn" | "err" | "ok";
}

export const STATUS: Record<StatusKey, StatusInfo> = {
  nao_iniciado:       { key: "nao_iniciado",       label: "Não iniciado",       dot: "⚪", tone: "muted" },
  em_estudo:          { key: "em_estudo",          label: "Em estudo",          dot: "🔵", tone: "info" },
  precisa_revisar:    { key: "precisa_revisar",    label: "Precisa revisar",    dot: "🔴", tone: "err" },
  em_desenvolvimento: { key: "em_desenvolvimento", label: "Em desenvolvimento", dot: "🟠", tone: "warn" },
  bom:                { key: "bom",                label: "Bom",                dot: "🟡", tone: "warn" },
  consolidado:        { key: "consolidado",        label: "Consolidado",        dot: "🟢", tone: "ok" },
};

/** Volume mínimo de questões respondidas para o status refletir desempenho. */
export const MIN_ANSWERED_FOR_STATUS = 4;

/**
 * Faixas de domínio. Abaixo do volume mínimo o status é "em estudo" —
 * 2 questões certas não fazem ninguém consolidado.
 */
export function computeStatus(answered: number, accuracy: number): StatusInfo {
  if (answered <= 0) return STATUS.nao_iniciado;
  if (answered < MIN_ANSWERED_FOR_STATUS) return STATUS.em_estudo;
  if (accuracy < 50) return STATUS.precisa_revisar;
  if (accuracy < 70) return STATUS.em_desenvolvimento;
  if (accuracy < 85) return STATUS.bom;
  return STATUS.consolidado;
}

/** Janela recente usada para detectar regressão. */
export interface RecentWindow {
  total: number;
  wrong: number;
  lastAt: string | null;
}

/** Mínimo de tentativas recentes para que a recência possa rebaixar o status. */
export const MIN_RECENT_FOR_DOWNGRADE = 5;
/** Proporção de erros recentes que caracteriza regressão. */
export const RECENT_ERROR_THRESHOLD = 0.4;

/**
 * Aplica recência ao status: domínio alto mas errando as últimas questões NÃO é
 * consolidado (§41). Esta função **só rebaixa** — nunca promove alguém por ter
 * acertado poucas questões recentes.
 */
export function computeStatusWithRecency(
  answered: number,
  accuracy: number,
  recent: RecentWindow,
): StatusInfo {
  const base = computeStatus(answered, accuracy);
  if (recent.total < MIN_RECENT_FOR_DOWNGRADE) return base;
  const errorRate = recent.wrong / recent.total;
  if (errorRate < RECENT_ERROR_THRESHOLD) return base;
  // regressão detectada: rebaixa consolidado/bom para "precisa revisar"
  if (base.key === "consolidado" || base.key === "bom") return STATUS.precisa_revisar;
  return base;
}

/** Progresso de trilha: 0–100. Ver `trail.ts` para o cálculo com disponibilidade. */
export function trailProgress(stepsDone: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const p = Math.round((stepsDone / totalSteps) * 100);
  return Math.max(0, Math.min(100, p));
}
