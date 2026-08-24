# Formato de importação de provas

Provas são importadas de arquivos JSON com o script `scripts/import-questions.ts`.
Nada é gerado automaticamente: **campos sem informação confiável ficam `null`.**

## Estrutura

```json
{
  "exam": {
    "slug": "transpetro-2023-dutos-e-terminais",
    "name": "Transpetro 2023 — Dutos e Terminais",
    "organization": "Transpetro",
    "bank": "Cesgranrio",
    "year": 2023,
    "category": "Dutos e Terminais",
    "description": "…",
    "total_questions": 60,
    "is_real_exam": true
  },
  "questions": [
    {
      "question_number": 1,
      "discipline": "Língua Portuguesa",
      "topic": null,
      "statement": "Enunciado da questão…",
      "options": { "A": "…", "B": "…", "C": "…", "D": "…", "E": "…" },
      "correct_answer": "A",
      "explanation": null,
      "explanation_source": null,
      "source": "Cesgranrio — …",
      "year": 2023,
      "bank": "Cesgranrio"
    }
  ]
}
```

### Campos

| Campo | Obrigatório | Observações |
|---|---|---|
| `exam.slug` | sim | chave única; reimportar com o mesmo slug **atualiza** (não duplica) |
| `exam.name` | sim | |
| `question_number` | sim | único dentro da prova |
| `discipline` | sim | casado pelo nome; cria a disciplina se não existir |
| `topic` | não | `null` = sem tópico. Só é criado quando informado explicitamente |
| `statement` | sim | |
| `options.A`–`.D` | sim | `options.E` é opcional (questões com 4 alternativas) |
| `correct_answer` | sim | uma letra entre A–E; **precisa existir** entre as opções |
| `explanation` | não | deixe `null` se não houver explicação confiável |
| `explanation_source` | não | `"oficial"` ou `"ia"`. Explicações de IA são **rotuladas** na interface |
| `difficulty` | não | 1–5, ou `null` |

## Como importar

1. Crie um projeto no [Supabase](https://supabase.com/dashboard) e aplique as migrations
   de `supabase/migrations/` (SQL editor ou `supabase db push`).
2. Copie `.env.example` para `.env.local` e preencha — incluindo `SUPABASE_SERVICE_ROLE_KEY`
   (Settings → API). **Essa chave é local; nunca vai para a Vercel.**
3. Valide antes de escrever:
   ```bash
   npm run import -- content/transpetro-2023.json --dry-run
   ```
4. Importe:
   ```bash
   npm run import -- content/transpetro-2023.json
   ```
   Use `--sample` para marcar a prova como conteúdo de demonstração (`is_sample`).

## Prova de 2023 já incluída

`content/transpetro-2023.json` traz a prova real **Transpetro 2023 — Prova 2 (Dutos e
Terminais)**, transcrita do caderno oficial da Cesgranrio, com o **gabarito definitivo**
(a questão 49 usa o gabarito alterado por recurso: **E**).

As questões cujas alternativas ou figuras são imagens no caderno original trazem uma nota
no enunciado apontando para o PDF oficial — o texto não foi inventado.

> Também há uma cópia dessa prova como migration SQL
> (`supabase/migrations/0006_seed_transpetro_2023.sql`), então aplicar as migrations já
> deixa a prova carregada **sem precisar rodar o importador**. Use o importador para novas
> provas ou para reimportar com explicações.
