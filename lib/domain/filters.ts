/** Filtros do Modo Estudo. */

export const STUDY_MODES = ["novas", "erradas", "respondidas", "todas"] as const;
export type StudyMode = (typeof STUDY_MODES)[number];

export const STUDY_MODE_LABELS: Record<StudyMode, string> = {
  novas: "Questões novas",
  erradas: "Questões que errei",
  respondidas: "Questões que já respondi",
  todas: "Todas",
};

export const STUDY_SIZES = [5, 10, 20, 30] as const;
export type StudySize = (typeof STUDY_SIZES)[number];

export interface StudyFilter {
  disciplineId: string | null; // null = todas
  topicId: string | null;
  mode: StudyMode;
  size: StudySize;
}

export function isStudyMode(v: unknown): v is StudyMode {
  return typeof v === "string" && (STUDY_MODES as readonly string[]).includes(v);
}

export function isStudySize(v: unknown): v is StudySize {
  const n = Number(v);
  return (STUDY_SIZES as readonly number[]).includes(n);
}

/** Le os filtros da querystring, caindo em padroes seguros. */
export function parseStudyFilter(params: {
  disciplina?: string | null;
  topico?: string | null;
  modo?: string | null;
  quantidade?: string | null;
}): StudyFilter {
  return {
    disciplineId: params.disciplina || null,
    topicId: params.topico || null,
    mode: isStudyMode(params.modo) ? params.modo : "todas",
    size: isStudySize(params.quantidade) ? (Number(params.quantidade) as StudySize) : 10,
  };
}

export function studyFilterToQuery(f: StudyFilter): string {
  const sp = new URLSearchParams();
  if (f.disciplineId) sp.set("disciplina", f.disciplineId);
  if (f.topicId) sp.set("topico", f.topicId);
  sp.set("modo", f.mode);
  sp.set("quantidade", String(f.size));
  return sp.toString();
}

/**
 * Aplica o recorte do modo sobre os ids candidatos.
 *
 * Puro de proposito: o `lib/db` busca (a) os ids que passam pelo filtro de
 * disciplina/topico e (b) o historico do usuario; a decisao de quais sobram
 * mora aqui e e testavel sem banco.
 */
export function selectQuestionIds(
  candidateIds: readonly string[],
  history: { answeredIds: ReadonlySet<string>; wrongIds: ReadonlySet<string> },
  mode: StudyMode,
  size: number,
): string[] {
  let pool: readonly string[];
  switch (mode) {
    case "novas":
      pool = candidateIds.filter((id) => !history.answeredIds.has(id));
      break;
    case "erradas":
      pool = candidateIds.filter((id) => history.wrongIds.has(id));
      break;
    case "respondidas":
      pool = candidateIds.filter((id) => history.answeredIds.has(id));
      break;
    case "todas":
      pool = candidateIds;
      break;
  }
  return pool.slice(0, size);
}
