# Preparatório Transpetro

Cockpit pessoal de preparação para o concurso **Transpetro / PSP / TERRA / Nível Médio —
ênfase Dutos e Terminais** (Cesgranrio, prova em 29/11/2026).

Não é uma plataforma de cursos: é um ambiente orientado a **questões, desempenho e
evolução**. O fluxo central é *fazer prova → errar → entender → refazer → medir*.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + RLS).
Pronto para deploy na Vercel.

## Projeto Supabase (já provisionado)

O backend já está criado e populado no projeto **`preparatorio-transpetro`**
(`hyzuhhpwwfawqzcpxgic`, região sa-east-1): schema + RLS aplicados, prova real de 2023 (60
questões, gabarito definitivo) e a amostra já carregadas.

- URL: `https://hyzuhhpwwfawqzcpxgic.supabase.co`
- Anon key (pública, pode ir para o browser/Vercel): veja Supabase → Settings → API.

### Um passo manual (autenticação)

Para poder entrar sem caixa de e-mail, no painel do Supabase vá em **Authentication →
Sign In / Providers → Email** e **desligue "Confirm email"**. Assim o cadastro em
`/cadastro` já entra direto. (Se preferir manter a confirmação ligada, o link de e-mail
usa `/auth/callback`, já implementado.)

## Como rodar

1. **Variáveis.** `cp .env.example .env.local` e preencha a URL e a anon key acima. A
   `SUPABASE_SERVICE_ROLE_KEY` só é necessária para reimportar provas — nunca configure na
   Vercel.
2. **Dependências e dev.**
   ```bash
   npm install
   npm run dev
   ```
3. Crie sua conta em `/cadastro` e comece pela prova de 2023 em **Simulados**.

> Para recriar o banco do zero (outro projeto), aplique em ordem os arquivos de
> `supabase/migrations/` (SQL editor ou `supabase db push`).

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

---

## V1.5 — Plataforma orientada a questões (Bloco A)

Entregue nesta versão (estendendo o MVP V1, sem recriar nada):

- **Auditoria da prova 2023** contra os PDFs oficiais (`docs/AUDITORIA-2023.md`): gabarito 100%
  correto (Q49=E por recurso); 59/60 enunciados fiéis. As **12 questões com figura** exibem a
  imagem real recortada do caderno (`public/questions/2023/`), no simulado, revisão e estudo.
- **Meu Edital** (`/edital`): árvore oficial do Anexo IV (LP 8 · MAT 10 · CE 38 tópicos sob 11
  grupos) com status por tópico; página do tópico com desempenho e atalhos de estudo.
- **Banco de Questões** (`/questoes`): filtros por disciplina/tópico/banca/ano/situação, com
  correção imediata e classificação do erro. Experiência de questão única reusada em todo lugar.
- **Meus Erros** (`/erros`): recorrentes (errou > 1×), tipo de erro, reestudar por tópico.
- **Simulados**: provas reais × personalizados (`/simulados/novo`, por disciplina/tópico) +
  diagnóstico pós-prova ("onde você perdeu pontos" → estudar estes tópicos).
- **Desempenho** (`/desempenho`): por disciplina/tópico/banca/origem + gráfico de evolução.
- **Dashboard**: pontos fortes/fracos, tópicos estudados × total, próxima ação.

Migrations `0007`–`0011` (schema final + edital) aplicadas no projeto Supabase; RLS sem alertas.

**V1.6 (próximo):** Módulo de Conteúdos (Unidade de Estudo — teoria/vídeo/áudio/flashcards/
quiz). O schema já está pronto (tabelas `study_*` criadas em `0008`), então não haverá refação.
