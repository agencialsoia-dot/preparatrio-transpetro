/**
 * Cronometro do simulado.
 *
 * A fonte de verdade e sempre `started_at` (timestamptz gravado pelo servidor).
 * O cliente nunca acumula um contador: ele recalcula `agora - started_at`. Isso
 * faz o tempo sobreviver a refresh, troca de aba e fechamento do navegador.
 */

/** Segundos decorridos desde o inicio. Nunca negativo. */
export function elapsedFrom(startedAt: string | Date, now: Date = new Date()): number {
  const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return seconds > 0 ? seconds : 0;
}

/** Formata segundos como HH:MM:SS. */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "--:--:--";
  }
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Formato curto para listas: "3h 12min" / "12min" / "45s". */
export function formatDurationShort(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const s = Math.floor(totalSeconds);
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}
