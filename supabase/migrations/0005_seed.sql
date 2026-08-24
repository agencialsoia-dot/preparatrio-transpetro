-- 0005_seed.sql — dados iniciais.
--
-- Contem DUAS coisas bem distintas:
--
--  1. As 3 disciplinas da prova e o registro da prova real Transpetro 2023
--     SEM NENHUMA QUESTAO. O caderno e o gabarito definitivo entram depois via
--     `npm run import` (ver docs/CONTENT_SCHEMA.md). Ate la o app mostra o card
--     da prova com o estado "conteudo ainda nao importado".
--
--  2. Uma prova de AMOSTRA (is_sample = true) com 5 questoes genericas, criada
--     apenas para voce conseguir percorrer o fluxo completo antes de ter o
--     conteudo real. Ela aparece com o selo "EXEMPLO" e fica fora do bloco
--     "PROVAS REAIS". Para remove-la:
--         delete from public.exams where is_sample = true;
--
-- NENHUMA questao, gabarito ou explicacao da prova oficial foi inventada aqui.

insert into public.disciplines (name, order_index) values
  ('Língua Portuguesa', 1),
  ('Matemática', 2),
  ('Conhecimentos Específicos', 3)
on conflict (name) do nothing;

-- ------------------------------------------- prova real (sem questoes ainda)
insert into public.exams
  (slug, name, organization, bank, year, category, description, total_questions, is_real_exam, is_sample)
values
  ('transpetro-2023-dutos-e-terminais',
   'Transpetro 2023 — Dutos e Terminais',
   'Transpetro',
   'Cesgranrio',
   2023,
   'Dutos e Terminais',
   'Profissional de Nível Médio — 10 questões de Língua Portuguesa, 10 de Matemática e 40 de Conhecimentos Específicos.',
   60,
   true,
   false)
on conflict (slug) do nothing;

-- -------------------------------------------------------- prova de amostra
insert into public.exams
  (slug, name, organization, bank, year, category, description, total_questions, is_real_exam, is_sample)
values
  ('amostra-demonstracao',
   'Amostra de demonstração',
   null, null, null, 'Demonstração',
   'Questões genéricas para testar o fluxo do app. NÃO é conteúdo de prova.',
   5, false, true)
on conflict (slug) do nothing;

insert into public.questions (
  exam_id, discipline_id, question_number, statement,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation, explanation_source, source, is_sample
)
select
  ex.id, d.id, q.num, q.statement,
  q.a, q.b, q.c, q.d, q.opt_e, q.correct, q.expl, null, 'Amostra de demonstração', true
from public.exams ex
cross join (values
  (1, 'Língua Portuguesa', 'AMOSTRA — Assinale a alternativa em que a palavra está grafada corretamente.',
      'excessão', 'exceção', 'esceção', 'excesão', 'exselção', 'B',
      'A grafia correta é "exceção".'),
  (2, 'Língua Portuguesa', 'AMOSTRA — Na frase "Os operadores revisaram os manuais", o sujeito é:',
      'oculto', 'indeterminado', 'simples', 'composto', 'inexistente', 'C',
      'Há um único núcleo de sujeito ("operadores"), portanto o sujeito é simples.'),
  (3, 'Matemática', 'AMOSTRA — Um tanque com 1.200 litros é esvaziado a 40 litros por minuto. Em quantos minutos ele fica vazio?',
      '20', '24', '30', '36', '40', 'C',
      '1.200 / 40 = 30 minutos.'),
  (4, 'Matemática', 'AMOSTRA — Qual é 15% de 480?',
      '62', '68', '70', '72', '75', 'D',
      '480 x 0,15 = 72.'),
  (5, 'Conhecimentos Específicos', 'AMOSTRA — Em um duto, a unidade do SI usada para pressão é:',
      'newton (N)', 'pascal (Pa)', 'joule (J)', 'watt (W)', 'kelvin (K)', 'B',
      'Pressão é força por área: 1 Pa = 1 N/m².')
) as q(num, disc, statement, a, b, c, d, opt_e, correct, expl)
join public.disciplines d on d.name = q.disc
where ex.slug = 'amostra-demonstracao'
on conflict (exam_id, question_number) do nothing;
