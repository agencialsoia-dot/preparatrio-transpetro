import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service role — IGNORA RLS.
 *
 * Uso exclusivo de scripts locais (scripts/import-questions.ts). Nunca importar
 * a partir de `app/` ou `components/`: a chave nao deve chegar ao navegador nem
 * ser configurada na Vercel.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY. " +
        "Copie .env.example para .env.local e preencha.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
