# Auditoria da Prova Transpetro 2023 — Dutos e Terminais (Cesgranrio, Prova 2)

Comparação da base (`content/transpetro-2023.json` → banco Supabase) com os PDFs oficiais:
caderno de questões e "Respostas aos Recursos" (gabarito definitivo). Realizada com PyMuPDF.

## Gabarito

- **Língua Portuguesa (1–10) e Matemática (11–20):** conferem 100% com a chave oficial.
- **Conhecimentos Específicos (21–60):** conferem 100% com a chave definitiva.
- **Q49:** gabarito **alterado por recurso** de `A` → **`E`**. A base já usa `E` (definitivo).
  Este é o único ponto em que a base diverge da grade *original* — e diverge **corretamente**,
  por refletir o resultado dos recursos.
- Nenhuma questão da Prova 2 foi anulada.

Sequência definitiva conferida (21–60):
`EBDACBDBEDBDDDACDDDDEADCDBEECDBDEBCCADE` — idêntica à base.

## Enunciados e alternativas

Cross-check por sobreposição de palavras de conteúdo entre a base e o texto do caderno:
**59 de 60 questões ≥ 85%** de sobreposição (transcrição fiel). A única abaixo do limiar é a
**Q25 (78%)**, exclusivamente porque suas alternativas são **estruturas químicas em imagem** —
resolvido ao embutir a figura oficial (ver abaixo).

## Questões com figura/imagem (12) — recuperadas do caderno oficial

As imagens foram recortadas da página original do caderno (PyMuPDF, 200–220 DPI), conferidas
visualmente uma a uma e salvas em `public/questions/2023/qNN.png`. O campo `image` de cada
questão no JSON aponta para o arquivo; a nota "consulte o PDF original" foi removida.

| Questão | Conteúdo da imagem |
|---|---|
| 12 | Alternativas A–E (expressões de juros compostos) |
| 13 | Tabela de bônus (nº de funcionários × valor) |
| 25 | Alternativas A–E (estruturas do PTFE) |
| 27 | Esquema de reações de hidrocarbonetos |
| 29 | Seção transversal da viga (momento fletor) |
| 30 | Plano inclinado sem atrito (massa m, ângulo α) |
| 31 | Viga biapoiada ABCD com carga P e força F |
| 32 | Estrutura de 3 barras (pino B, 30°, carga P) |
| 35 | Alternativas A–E (força magnética) |
| 39 | Tubo de Venturi (S1, S2, P1, P2, Δh) |
| 40 | Reservatório elevado (h1, h2, saída V) |
| 56 | Três vasos A, B, C com mesmo nível de água |

> Observação: para as questões cujas **alternativas** são imagens (12, 25, 35), a imagem oficial
> é a referência autoritativa das opções; o texto das alternativas no JSON é uma transcrição
> aproximada e a seleção é feita pela letra (A–E). A Q13 tem tabela no enunciado (imagem) e
> alternativas em fórmula (transcritas).

## Conclusão

A base reflete fielmente a prova oficial e o gabarito definitivo. Nenhum valor foi inventado;
correções limitaram-se ao confirmável pelos PDFs. Fontes em `content/fontes-2023/`.
