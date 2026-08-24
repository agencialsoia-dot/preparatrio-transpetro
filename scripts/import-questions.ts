/**
 * Importa uma prova (JSON) para o Supabase.
 *
 *   npm run import -- ./content/transpetro-2023.json            # importa
 *   npm run import -- ./content/transpetro-2023.json --dry-run  # so valida
 *   npm run import -- ./content/exemplo.json --sample           # marca is_sample
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local.
 * Idempotente: rodar duas vezes atualiza, nao duplica.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importFileSchema, validateConsistency, type ImportFile } from "./content-schema.ts";
import { createServiceClient } from "../lib/supabase/service.ts";
import { loadEnv } from "./load-env.ts";

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) fail("Informe o arquivo JSON. Ex.: npm run import -- ./content/exemplo.json");
  return {
    file: resolve(file),
    dryRun: args.includes("--dry-run"),
    sample: args.includes("--sample"),
  };
}

function readAndValidate(path: string): ImportFile {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    fail(`Nao consegui ler o arquivo: ${path}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    fail(`JSON invalido: ${(e as Error).message}`);
  }

  const parsed = importFileSchema.safeParse(json);
  if (!parsed.success) {
    console.error("\n✗ O arquivo nao segue o formato esperado (docs/CONTENT_SCHEMA.md):\n");
    for (const issue of parsed.error.issues) {
      console.error(`  · ${issue.path.join(".") || "(raiz)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const issues = validateConsistency(parsed.data);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  for (const w of warnings) console.warn(`  ! aviso: ${w.message}`);
  if (errors.length) {
    console.error("\n✗ Inconsistencias que impedem a importacao:\n");
    for (const e of errors) console.error(`  · ${e.message}`);
    console.error("");
    process.exit(1);
  }

  return parsed.data;
}

async function main() {
  const { file, dryRun, sample } = parseArgs();
  loadEnv();

  console.log(`\nArquivo: ${file}`);
  const data = readAndValidate(file);

  const disciplines = [...new Set(data.questions.map((q) => q.discipline))];
  console.log(`Prova:   ${data.exam.name} (${data.exam.slug})`);
  console.log(`Questoes: ${data.questions.length}`);
  for (const d of disciplines) {
    const n = data.questions.filter((q) => q.discipline === d).length;
    console.log(`  · ${d}: ${n}`);
  }
  const semExplicacao = data.questions.filter((q) => !q.explanation).length;
  const semTopico = data.questions.filter((q) => !q.topic).length;
  console.log(`Sem explicacao: ${semExplicacao} · sem topico: ${semTopico} (ficam null)`);

  if (dryRun) {
    console.log("\n✓ Validacao OK. Nada foi escrito (--dry-run).\n");
    return;
  }

  const db = createServiceClient();

  // ------------------------------------------------------------- exam
  const { data: exam, error: examErr } = await db
    .from("exams")
    .upsert(
      {
        slug: data.exam.slug,
        name: data.exam.name,
        organization: data.exam.organization ?? null,
        bank: data.exam.bank ?? null,
        year: data.exam.year ?? null,
        category: data.exam.category ?? null,
        description: data.exam.description ?? null,
        total_questions: data.exam.total_questions ?? data.questions.length,
        is_real_exam: sample ? false : data.exam.is_real_exam,
        is_sample: sample,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (examErr) fail(`Falha ao gravar a prova: ${examErr.message}`);

  // ------------------------------------------------------ disciplines
  const disciplineIds = new Map<string, string>();
  for (const name of disciplines) {
    const { data: row, error } = await db
      .from("disciplines")
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single();
    if (error) fail(`Falha na disciplina "${name}": ${error.message}`);
    disciplineIds.set(name, row.id);
  }

  // ----------------------------------------------------------- topics
  // Apenas topicos explicitamente informados no arquivo. Nada e inferido.
  const topicIds = new Map<string, string>();
  for (const q of data.questions) {
    if (!q.topic) continue;
    const key = `${q.discipline}::${q.topic}`;
    if (topicIds.has(key)) continue;
    const { data: row, error } = await db
      .from("topics")
      .upsert(
        { discipline_id: disciplineIds.get(q.discipline)!, name: q.topic },
        { onConflict: "discipline_id,name" },
      )
      .select("id")
      .single();
    if (error) fail(`Falha no topico "${q.topic}": ${error.message}`);
    topicIds.set(key, row.id);
  }

  // -------------------------------------------------------- questions
  const rows = data.questions.map((q) => ({
    exam_id: exam.id,
    discipline_id: disciplineIds.get(q.discipline)!,
    topic_id: q.topic ? (topicIds.get(`${q.discipline}::${q.topic}`) ?? null) : null,
    question_number: q.question_number,
    statement: q.statement,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    option_e: q.options.E ?? null,
    correct_answer: q.correct_answer,
    explanation: q.explanation ?? null,
    explanation_source: q.explanation_source ?? null,
    source: q.source ?? null,
    year: q.year ?? data.exam.year ?? null,
    bank: q.bank ?? data.exam.bank ?? null,
    difficulty: q.difficulty ?? null,
    is_sample: sample,
  }));

  const { error: qErr } = await db
    .from("questions")
    .upsert(rows, { onConflict: "exam_id,question_number" });
  if (qErr) fail(`Falha ao gravar as questoes: ${qErr.message}`);

  console.log(`\n✓ Importado: ${rows.length} questoes em "${data.exam.name}".`);
  console.log(sample ? "  (marcadas como AMOSTRA)\n" : "");
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
