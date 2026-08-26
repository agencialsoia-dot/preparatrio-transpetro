-- 0013: subtópicos críticos (listados pelo usuário) + seed de prioridade P1–P4.
--
-- Regras aplicadas:
--  * Subtópicos só existem porque o USUÁRIO os listou — nada foi inventado.
--  * "Bombas" fica APENAS sob Equipamentos de Processo (CE-17.1). A tabela tem
--    UNIQUE (discipline_id, name) e ambas as listas estão em Conhecimentos
--    Específicos — duplicar quebraria a migration. Em Mecânica dos Fluidos ele
--    aparece no bloco "o que mais cai" como link para CE-17.1.
--  * Prioridade de Básicos ajustada pela incidência REAL da prova 2023.
--  * Não rebaixamos por "0 ocorrências": com uma única prova na base, ausência
--    não é evidência de que não cai.

-- ------------------------------------- subtópicos de Mecânica dos Fluidos (CE-12)
insert into public.topics (discipline_id, name, parent_id, order_index, code)
select d.id, v.name, p.id, v.ord, v.code
from (values
  ('Propriedades dos fluidos',     1, 'CE-12.1'),
  ('Pressão',                      2, 'CE-12.2'),
  ('Hidrostática',                 3, 'CE-12.3'),
  ('Vazão',                        4, 'CE-12.4'),
  ('Equação da continuidade',      5, 'CE-12.5'),
  ('Equação de Bernoulli',         6, 'CE-12.6'),
  ('Tubo de Venturi',              7, 'CE-12.7'),
  ('Escoamento em tubulações',     8, 'CE-12.8'),
  ('Perda de carga',               9, 'CE-12.9')
) as v(name, ord, code)
join public.disciplines d on d.name = 'Conhecimentos Específicos'
join public.topics p on p.discipline_id = d.id and p.code = 'CE-12'
on conflict (discipline_id, name) do nothing;

-- -------------------------------- subtópicos de Equipamentos de Processo (CE-17)
insert into public.topics (discipline_id, name, parent_id, order_index, code)
select d.id, v.name, p.id, v.ord, v.code
from (values
  ('Bombas',                 1, 'CE-17.1'),
  ('Compressores',           2, 'CE-17.2'),
  ('Permutadores de calor',  3, 'CE-17.3')
) as v(name, ord, code)
join public.disciplines d on d.name = 'Conhecimentos Específicos'
join public.topics p on p.discipline_id = d.id and p.code = 'CE-17'
on conflict (discipline_id, name) do nothing;

-- ==================================================================
-- PRIORIDADE — CONHECIMENTOS ESPECÍFICOS (lista do usuário)
-- ==================================================================
update public.topics set priority_level = v.lvl
from (values
  -- P1
  ('CE-12','P1'),  -- Mecânica dos Fluidos
  ('CE-5','P1'),   -- Instrumentação: tipos, terminologia e simbologia
  ('CE-10','P1'),  -- Mecânica geral
  ('CE-16','P1'),  -- Termodinâmica básica
  ('CE-1','P1'),   -- Noções de metrologia
  -- P2
  ('CE-15','P2'),  -- Resistência dos materiais
  ('CE-17.1','P2'),-- Bombas
  ('CE-13','P2'),  -- Transmissão de calor
  ('CE-38','P2'),  -- Noções de eletricidade e eletrônica
  ('CE-36','P2'),  -- Eletromagnetismo
  ('CE-3','P2'),   -- Controle de processos
  ('CE-17','P2'),  -- Equipamentos de processo (pai)
  ('CE-2','P2'),   -- Transmissão e transmissores
  ('CE-4','P2'),   -- Elementos finais de controle
  ('CE-6','P2'),   -- Sistemas instrumentados de segurança
  ('CE-9','P2'),   -- Instrumentos de medição
  -- P3
  ('CE-17.2','P3'),-- Compressores
  ('CE-17.3','P3'),-- Permutadores de calor
  ('CE-32','P3'),  -- Operações unitárias
  ('CE-33','P3'),  -- Processos de refino
  ('CE-18','P3'),  -- Segurança, meio ambiente e saúde
  ('CE-7','P3'),   -- Definições e unidades de medição
  ('CE-8','P3'),   -- Sistema Internacional de Unidades
  ('CE-11','P3'),  -- Conservação da energia mecânica
  ('CE-14','P3'),  -- Máquinas térmicas
  ('CE-34','P3'),  -- Eletrostática
  ('CE-35','P3'),  -- Cargas elétricas em movimento
  -- P4
  ('CE-37','P4')   -- Radiações eletromagnéticas
) as v(code, lvl)
where public.topics.code = v.code;

-- Química (P1): todas as folhas do grupo Química
update public.topics set priority_level = 'P1'
where code in ('CE-19','CE-20','CE-21','CE-22','CE-23','CE-24','CE-25','CE-26','CE-27','CE-28','CE-29','CE-30','CE-31');

-- Subtópicos de Fluidos herdam P1 do pai (são o "o que mais cai" da disciplina)
update public.topics set priority_level = 'P1'
where code in ('CE-12.1','CE-12.2','CE-12.3','CE-12.4','CE-12.5','CE-12.6','CE-12.7','CE-12.8','CE-12.9');

-- ==================================================================
-- PRIORIDADE — CONHECIMENTOS BÁSICOS
-- Base: lista do usuário AJUSTADA pela incidência real da prova 2023.
-- Português (10q): Coesão 3x · Compreensão 2x · demais 1x · Ortografia 0x
-- Matemática (10q): Estatística 2x · Razão/proporção 2x · Equações 2x · demais 1x
-- ==================================================================
update public.topics set priority_level = v.lvl
from (values
  -- Português
  ('LP-3','P1'),   -- Coesão textual — MAIS cobrado (3/10): promovido de P3
  ('LP-1','P1'),   -- Compreensão de textos (2/10)
  ('LP-8','P1'),   -- Significação das palavras
  ('LP-7','P2'),   -- Sinais de pontuação
  ('LP-6','P2'),   -- Crase
  ('LP-5','P3'),   -- Concordância nominal e verbal
  ('LP-4','P3'),   -- Emprego das classes de palavras
  ('LP-2','P4'),   -- Ortografia (0/10 — curadoria e incidência concordam)
  -- Matemática
  ('MAT-2','P1'),  -- Razão e proporção; porcentagem (2/10) = "aritmética e problemas"
  ('MAT-4','P1'),  -- Equações e sistemas lineares (2/10)
  ('MAT-7','P1'),  -- Estatística (2/10): promovido de P2
  ('MAT-3','P1'),  -- Funções
  ('MAT-8','P2'),  -- Matemática financeira
  ('MAT-9','P2'),  -- Geometria plana
  ('MAT-10','P3'), -- Geometria espacial (0/10): separada da plana
  ('MAT-1','P3'),  -- Conjuntos numéricos: promovido de P4 (caiu 1x)
  ('MAT-6','P3'),  -- Probabilidade (0/10 — mantido: 1 prova é evidência fraca)
  ('MAT-5','P3')   -- Análise combinatória (idem)
) as v(code, lvl)
where public.topics.code = v.code;

-- ==================================================================
-- Componentes do score, semeados a partir do nível como PONTO DE PARTIDA
-- editável. historical_frequency fica NULL — será CALCULADO, nunca chutado.
-- ==================================================================
update public.topics set
  edital_relevance = case priority_level when 'P1' then 95 when 'P2' then 75 when 'P3' then 55 else 35 end,
  career_relevance = case priority_level when 'P1' then 90 when 'P2' then 70 when 'P3' then 50 else 30 end,
  difficulty_level = coalesce(difficulty_level, case priority_level when 'P1' then 4 when 'P2' then 3 else 2 end)
where priority_level is not null;
