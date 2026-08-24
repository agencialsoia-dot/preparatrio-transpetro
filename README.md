# Preparatório Transpetro

Cockpit pessoal de preparação para o concurso **Transpetro / PSP / TERRA / Nível Médio —
ênfase Dutos e Terminais** (Cesgranrio, prova em 29/11/2026).

Não é uma plataforma de cursos: é um ambiente orientado a **questões, desempenho e
evolução**. O fluxo central é *fazer prova → errar → entender → refazer → medir*.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + RLS).
Pronto para deploy na Vercel.

## Como rodar

1. **Banco.** Crie um projeto no [Supabase](https://supabase.com/dashboard) e aplique, em
   ordem, os arquivos de `supabase/migrations/` (SQL editor ou `supabase db push`). Isso já
   deixa a prova real de 2023 carregada.
2. **Variáveis.** `cp .env.example .env.local` e preencha (Settings → API do Supabase). A
   `SUPABASE_SERVICE_ROLE_KEY` é usada **apenas** pelo importador local — nunca configure na
   Vercel.
3. **Dependências e dev.**
   ```bash
   npm install
   npm run dev
   ```
4. Crie sua conta em `/cadastro` e comece pela prova de 2023 em **Simulados**.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Testes unitários da lógica de domínio (`lib/domain`) |
| `npm run import -- <arquivo.json> [--dry-run] [--sample]` | Importa uma prova (ver `docs/CONTENT_SCHEMA.md`) |

## Conteúdo

A prova **Transpetro 2023 — Dutos e Terminais** (60 questões, gabarito definitivo, Q49
alterada por recurso para E) está em `content/transpetro-2023.json` e também como migration
SQL. Transcrição fiel do caderno oficial da Cesgranrio — nada de questões, gabaritos ou
explicações inventados.

Há uma prova de **amostra** (`is_sample`) só para testar o fluxo; ela aparece com o selo
"Exemplo". Para removê-la:

```sql
delete from public.exams where is_sample = true;
```

## Estrutura

```
app/(auth)      login, cadastro, callback
app/(app)       dashboard, simulados, estudar, erros, desempenho, historico
components/      ui (design system), layout (nav), questions, stats
lib/domain/      lógica pura e testada: scoring, stats, filtros, timer, shuffle
lib/db/          acesso a dados (Supabase) — única camada que toca o banco
lib/supabase/    clients browser/server/middleware/service
supabase/migrations/  schema + RLS + seed
scripts/         importador de provas
docs/            formato de importação
```

RLS garante que os dados de cada usuário (tentativas, simulados) são privados; o conteúdo
das provas é somente-leitura para usuários autenticados.
