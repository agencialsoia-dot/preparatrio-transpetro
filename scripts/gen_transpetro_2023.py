# -*- coding: utf-8 -*-
"""Gera content/transpetro-2023.json a partir da transcricao fiel do caderno
oficial (Cesgranrio 2023 — Prova 2, Dutos e Terminais) e do gabarito definitivo.
Q49 usa o gabarito ALTERADO por recurso (E)."""
import json

FIG = "\n\n[O caderno oficial apresenta uma figura/estrutura para esta questão; consulte o PDF original para o diagrama completo.]"
FORM = "\n\n[As alternativas desta questão são expressões/estruturas exibidas como imagem no caderno oficial; consulte o PDF original.]"

TEXTO_LP = (
    "Texto para as questões de 1 a 10 — \"Brasil, paraíso dos agrotóxicos\" (KUGLER, H. "
    "Revista Ciência Hoje, n. 296, v. 50. RJ: SBPC, set. 2012. Adaptado).\n\n"
    "O Brasil vive um drama: ao acordar do sonho de uma economia agrária pujante, o país "
    "desperta para o pesadelo de ser, pelo quinto ano consecutivo, o maior consumidor de "
    "agrotóxicos do planeta. Balança comercial tinindo; agricultura a todo vapor. Mas quanto "
    "custa, por exemplo, uma saca de milho, soja ou algodão? Será que o preço de tais "
    "commodities – que há tempos são o motor de uma economia primária à la colonialismo "
    "moderno – compensa os prejuízos sociais e ambientais negligenciados nos cálculos do "
    "comércio internacional? (parágrafo 1)\n\n"
    "\"Pergunta difícil\", diz o economista Wagner Soares, do IBGE. A Bolsa de Chicago define o "
    "preço da soja; mas não considera que, para se produzir cada saca, são aplicadas generosas "
    "doses de agrotóxicos que permanecem no ambiente natural – e no ser humano – por anos ou "
    "mesmo décadas. \"Ao final das contas, quem paga pela intoxicação dos trabalhadores e pela "
    "contaminação ambiental é a sociedade\", afirma Soares. Em seu melhor economês, ele garante "
    "que as \"externalidades negativas\" de nosso modelo agrário continuam de fora dos cálculos. "
    "(parágrafo 2)\n\n"
    "Segundo o economista do IBGE, que estudou propriedades rurais no Paraná, cada dólar gasto "
    "na compra de agrotóxicos pode custar aos cofres públicos 1,28 dólar em futuros gastos com a "
    "saúde de camponeses intoxicados. Mas este é um valor subestimado. Afinal, Soares "
    "contabilizou apenas os custos referentes a intoxicações agudas. Levando-se em conta os "
    "casos crônicos, acrescidos da contaminação ambiental difusa nos ecossistemas, os prejuízos "
    "podem atingir cifras assustadoramente maiores. (parágrafo 3)\n\n"
    "Seja na agricultura familiar, seja nas grandes propriedades rurais, \"os impactos dos "
    "agrotóxicos na saúde pública abrangem vastos territórios e envolvem diferentes grupos "
    "populacionais\", afirma dossiê publicado pela Abrasco. (parágrafo 4)\n\n"
    "Não são apenas agricultores e suas famílias que integram grupos de risco. Todos os milhares "
    "de profissionais envolvidos no comércio e na manipulação dessas substâncias são potenciais "
    "vítimas. E, além deles, \"todos nós, diariamente, a cada refeição, ingerimos princípios "
    "ativos de agrotóxicos em nossos alimentos\", garante uma médica da UFC. \"Hoje, todo mundo "
    "come veneno\", afirma um agricultor. (parágrafo 5)\n\n"
    "Produtores e especialistas alinhados ao modelo convencional de produção agrícola insistem: "
    "sem agrotóxicos seria impossível alimentar uma população mundial em constante expansão. "
    "Esses venenos seriam, portanto, um mal necessário, de acordo com esses produtores. "
    "Agricultores garantem que não há nenhuma dificuldade em produzir alimentos orgânicos, sem "
    "agrotóxicos, para alimentar a população. Segundo eles, \"a humanidade domina a agricultura "
    "há pelo menos 10 mil anos, e o modelo imposto no século 20 vem apagando a herança e o "
    "acúmulo de conhecimento dos métodos tradicionais.\" (parágrafo 6)\n\n"
    "Mas a pergunta que não quer calar é: será que um modelo dito \"alternativo\" teria potencial "
    "para alimentar uma população que, até 2050, deverá chegar a 9 bilhões? Certamente tem muito "
    "mais potencial do que o agronegócio que, hoje, não dá conta nem de alimentar 7 bilhões, "
    "retrucam estudiosos. Sistemas de produção descentralizados têm muito mais condições de "
    "produzir e distribuir alimentos em quantidade e qualidade. Precisamos de outra estrutura "
    "agrária – baseada em propriedades menores, com produção diversificada, privilegiando "
    "mercados locais e contemplando a conservação da biodiversidade. A engenheira agrônoma "
    "Flávia Londres assina embaixo e defende que \"Monoculturas são grandes desertos verdes. A "
    "agroecologia, portanto, requer uma mudança paradigmática no modelo agrário, que resultaria, "
    "na verdade, em uma mudança cultural\". (parágrafo 7)"
)

GAB = {1:"A",2:"E",3:"A",4:"E",5:"D",6:"B",7:"C",8:"C",9:"D",10:"A",
       11:"A",12:"A",13:"E",14:"B",15:"E",16:"B",17:"E",18:"B",19:"D",20:"D",
       21:"E",22:"B",23:"D",24:"A",25:"C",26:"B",27:"D",28:"B",29:"E",30:"D",
       31:"B",32:"D",33:"D",34:"D",35:"A",36:"C",37:"D",38:"D",39:"D",40:"D",
       41:"E",42:"A",43:"D",44:"C",45:"D",46:"B",47:"E",48:"A",49:"E",50:"C",
       51:"D",52:"B",53:"D",54:"E",55:"B",56:"C",57:"C",58:"A",59:"D",60:"E"}

# (numero, statement, [A,B,C,D,E])
Q = {}
def add(n, stmt, opts):
    Q[n] = (stmt, opts)

add(1, TEXTO_LP + "\n\nO objetivo principal do texto é discutir a", [
 "contraposição entre a agricultura orgânica e a convencional, baseada no uso de agrotóxicos.",
 "implementação de monoculturas para a renovação do bem-sucedido modelo agrário brasileiro.",
 "importância de o nosso país se manter na liderança na concorrência mundial do agronegócio.",
 "intoxicação dos trabalhadores e a contaminação ambiental provocados pela agricultura familiar.",
 "perspectiva de o agronegócio conseguir produzir alimentos para uma população de sete bilhões de pessoas."])

add(2, "O trecho que apresenta a proposta do autor para a solução do problema discutido é:", [
 "\"O Brasil vive um drama: ao acordar do sonho de uma economia agrária pujante, o país desperta para o pesadelo de ser, pelo quinto ano consecutivo, o maior consumidor de agrotóxicos do planeta\" (parágrafo 1)",
 "\"A Bolsa de Chicago define o preço da soja; mas não considera que, para se produzir cada saca, são aplicadas generosas doses de agrotóxicos que permanecem no ambiente natural – e no ser humano – por anos ou mesmo décadas\" (parágrafo 2)",
 "\"Levando-se em conta os casos crônicos, acrescidos da contaminação ambiental difusa nos ecossistemas, os prejuízos podem atingir cifras assustadoramente maiores.\" (parágrafo 3)",
 "\"Todos os milhares de profissionais envolvidos no comércio e na manipulação dessas substâncias são potenciais vítimas.\" (parágrafo 5)",
 "\"Precisamos de outra estrutura agrária – baseada em propriedades menores, com produção diversificada, privilegiando mercados locais e contemplando a conservação da biodiversidade.\" (parágrafo 7)"])

add(3, "No trecho \"Em seu melhor economês, ele garante que as 'externalidades negativas' de nosso modelo agrário continuam de fora dos cálculos\" (parágrafo 2), a expressão destacada refere-se a", [
 "prejuízos sociais e ambientais causados pelo uso dos agrotóxicos",
 "opiniões dos produtores sobre os benefícios dos agrotóxicos",
 "lucros obtidos com o grande crescimento do agronegócio",
 "influências negativas de outros países na economia agrária",
 "efeitos do aumento das commodities na economia brasileira"])

add(4, "Considere os dois períodos do seguinte trecho do parágrafo 6: \"Esses venenos seriam, portanto, um mal necessário, de acordo com esses produtores. Agricultores garantem que não há nenhuma dificuldade em produzir alimentos orgânicos, sem agrotóxicos, para alimentar a população\". Para transformá-los em um só período, mantendo-se o sentido do trecho original, deve-se empregar a palavra", [
 "para","porque","quando","portanto","entretanto"])

add(5, "No trecho \"ao acordar do sonho de uma economia agrária pujante, o país desperta para o pesadelo de ser, pelo quinto ano consecutivo, o maior consumidor de agrotóxicos do planeta\" (parágrafo 1), a palavra destacada pode ser substituída, sem prejuízo do sentido, por", [
 "apreciada","incipiente","inoperante","possante","moderna"])

add(6, "No trecho \"Esses venenos seriam, portanto, um mal necessário, de acordo com esses produtores.\" (parágrafo 6), a palavra destacada veicula a relação lógica de", [
 "adição","conclusão","concessão","explicação","temporalidade"])

add(7, "No texto, o referente da palavra ou expressão em destaque está corretamente explicitado, entre colchetes, no trecho do", [
 "parágrafo 1 – \"Será que o preço de tais commodities – que há tempos são o motor de uma economia primária\" [agrotóxicos]",
 "parágrafo 3 – \"Mas este é um valor subestimado.\" [cada dólar gasto na compra de agrotóxicos]",
 "parágrafo 5 – \"Todos os milhares de profissionais envolvidos no comércio e na manipulação dessas substâncias são potenciais vítimas.\" [agrotóxicos]",
 "parágrafo 5 – \"E, além deles, 'todos nós, diariamente, a cada refeição, ingerimos princípios ativos de agrotóxicos em nossos alimentos'\" [especialistas]",
 "parágrafo 6 – \"Segundo eles, 'a humanidade domina a agricultura há pelo menos 10 mil anos'\" [produtores e especialistas]"])

add(8, "O acento grave indicativo de crase está empregado de acordo com a norma-padrão da língua portuguesa, na palavra destacada em:", [
 "A água consumida pela população apresenta resíduos de agrotóxicos, o que prejudica a vida de todos que à ingerem, por estar contaminada.",
 "A produção de alimentos orgânicos, sem agrotóxicos, representa um avanço considerável na economia brasileira, pois beneficia à agricultura familiar.",
 "Os especialistas chegaram à conclusão de que os governos precisam tomar medidas para prevenir os estragos causados pelos agrotóxicos.",
 "A valorização do meio ambiente permite aos seus defensores alcançarem os objetivos propostos e se aplica à diversas situações que envolvem o bem-estar da população.",
 "Os agricultores responsáveis pelas colheitas de soja foram forçados à adotar práticas para prevenir a ameaça de redução de suas safras."])

add(9, "O emprego da vírgula está plenamente de acordo com as exigências da norma-padrão da língua portuguesa em:", [
 "A enorme quantidade de agrotóxicos empregados, para exterminar pragas nas plantações contamina as águas e os solos de toda a região.",
 "A função dos agrotóxicos de acordo com os produtores, é reduzir a quantidade de pragas e facilitar a vida do agricultor para que ele tenha seus lucros garantidos.",
 "A presença de pragas nos alimentos, pode sofrer uma grande redução se for possível dar preferência a alimentos cozidos ao invés de in natura.",
 "Estudos realizados em várias partes do mundo têm provado que os alimentos orgânicos, sem uso de fertilizantes químicos, respeitam a saúde dos trabalhadores e dos consumidores.",
 "O depoimento de especialistas que estudam meios de melhorar a produção agrícola, revela que o extermínio de pragas na lavoura tem sido realizado de forma inadequada."])

add(10, "De acordo com as regras de concordância nominal da norma-padrão da língua portuguesa, a palavra destacada está empregada corretamente em:", [
 "A mudança das leis sobre o uso de agrotóxicos e a repressão dos órgãos de vigilância sanitária devem ser implementadas com urgência para evitar mais mortes.",
 "As leis instituídas para proteger os cidadãos e os ensinamentos dos estudiosos sobre o uso de agrotóxicos devem ser divulgadas para que tenham alcance geral.",
 "O desenvolvimento de novas estratégias de plantio e a substituição da agricultura convencional pela orgânica são consideradas uma exigência dos tempos atuais para muitos produtores rurais.",
 "Os estudos realizados por especialistas de saúde em laboratórios e a busca por exterminar doenças contagiosas são indicativas do progresso da medicina nos últimos tempos.",
 "Os procedimentos orientados pelos especialistas e a concessão de verbas públicas pelos órgãos governamentais têm sido entendidas como imprescindíveis para o desenvolvimento da agricultura familiar."])
echo_ok=1

add(11, "Considerando-se os números reais 275, 350 e 437, o menor e o maior deles são, respectivamente,", [
 "437 e 350","437 e 275","350 e 275","350 e 437","275 e 437"])

add(12, "Suponha que, em 1994, um artigo custasse R$ 13,91 e, exatos 28 anos depois (336 meses), ele passasse a custar R$ 100,00. Suponha, também, que, para esse período, a taxa mensal de aumento no preço desse artigo tenha sido igual a k%, ou seja, a cada mês o preço do artigo sofreu um aumento de k% em relação ao preço do mês anterior. O valor de k pode ser dado por" + FORM, [
 "k = [ (100/13,91)^(1/336) − 1 ] × 100",
 "k = [ (100/13,91)^336 − 1 ] × 100",
 "k = [ (100/13,91) − 1 ]^(1/336) × 100",
 "k = [ (100/13,91) + 1 ]^336 × 0,01",
 "k = [ (100/13,91) + 1 ]^(1/336) × 0,01"])

add(13, "Uma empresa, em reconhecimento ao desempenho de 10 de seus funcionários, decide dar-lhes um bônus. Para tanto, a empresa distribuiu um total de R$ 25.000,00: 6 funcionários receberam R$ 2.000, 2 receberam R$ 2.500 e 2 receberam R$ 4.000. Nessas condições, o desvio padrão dos bônus pagos é dado por" + FORM, [
 "√[ (36·2000² + 4·2500² + 4·4000²) / 10 ]",
 "√[ (36·500² + 4·2500² + 4·1500²) / 10 ]",
 "√[ (6·2000² + 2·2500² + 2·4000²) / 10 ]",
 "√[ (500² + 1500²) / 10 ]",
 "√[ (6·500² + 2·1500²) / 10 ]"])

add(14, "O quadrado de um número real x é representado por x², e é definido por x² = x·x. A condição x ≤ x² é FALSA quando x é igual a", [
 "0","1/2","1","−1/2","3/2"])

add(15, "Em uma escola, há cinco turmas que fizeram uma prova de matemática, e cada uma possui 60 estudantes. As notas obtidas em cada turma tiveram as seguintes distribuições: Turma 1: 30 notas iguais a 0 e 30 notas iguais a 10; Turma 2: 30 notas iguais a 2 e 30 notas iguais a 8; Turma 3: 30 notas iguais a 3 e 30 notas iguais a 7; Turma 4: 30 notas iguais a 4 e 30 notas iguais a 6; Turma 5: 60 notas iguais a 5. Em qual das turmas o desvio-padrão das notas obtidas foi igual a zero?", [
 "Turma 1","Turma 2","Turma 3","Turma 4","Turma 5"])

add(16, "Um carro partiu de um ponto A até um ponto B andando com uma velocidade constante de 80 km/h. Posteriormente o carro refez o mesmo percurso, mas agora com velocidade constante igual a 100 km/h, e gastou 30 minutos a menos do que na primeira vez. Quanto tempo o carro levou para ir do ponto A ao ponto B, na primeira vez?", [
 "3h","2h30min","2h","1h50min","1h30min"])

add(17, "Em uma fábrica, há um tanque cuja capacidade máxima é de 180 m³. Estando o tanque vazio, três torneiras de mesma vazão gastam oito horas para enchê-lo completamente. Um outro tanque, com capacidade máxima de x metros cúbicos, está sendo construído e, quando vazio, cinco torneiras (com a mesma vazão das anteriores) deverão enchê-lo completamente em apenas y horas. Nessas condições, o valor de y em função de x é definido por", [
 "y = 2x/81","y = 2x/54","y = 2x/45","y = 2x/27","y = 2x/75"])

add(18, "Em um torneio de videogame, o menino J disputou apenas três partidas, fazendo um total de 2.660 pontos. Na segunda partida, ele fez 410 pontos a mais do que fez na primeira; na terceira partida, fez apenas metade de pontos que fez na segunda. O número de pontos feitos por J, apenas na primeira partida, quando dividido por 5, deixa resto igual a", [
 "4","3","2","1","0"])

add(19, "O triângulo ABC é retângulo em A. Sabe-se que o comprimento da hipotenusa BC é igual a 20 cm, e que o comprimento do cateto AB é igual a 12 cm. Qual é a área, em cm², do triângulo ABC?", [
 "16","48","60","96","240"])

add(20, "Um consumidor foi ao mercado, comprou 1 kg de batata e 1 kg de cebola e pagou R$ 11,00. No dia seguinte, ele comprou 3 kg de batata e 2 kg de cebola e pagou R$ 28,00. No terceiro dia, ele comprou 2 kg de batata e 1 kg de cebola. Considerando-se que os preços não foram alterados durante esse período, que valor, em R$, o consumidor pagou no terceiro dia?", [
 "5","6","16","17","39"])

add(21, "A distribuição eletrônica e a posição na tabela periódica, do elemento químico com número atômico 12, em seu estado fundamental, são, respectivamente,", [
 "1s² 2s² 2p⁴ 3s² ; 2º período, grupo 2",
 "1s² 2s² 2p⁶ 3s² ; 2º período, grupo 3",
 "1s² 2s² 2p⁴ 3s² ; 3º período, grupo 2",
 "1s² 2s² 2p⁶ 3s² ; 3º período, grupo 3",
 "1s² 2s² 2p⁶ 3s² ; 3º período, grupo 2"])

add(22, "A molécula de oxigênio pode ser representada como :Ö=Ö: , segundo o modelo de estruturas de Lewis. O número de elétrons que estão sendo compartilhados para formar a ligação covalente é igual a", [
 "2","4","8","10","12"])

add(23, "Um balão flexível contém um gás que se comporta idealmente. Na situação inicial, o volume ocupado pelo gás é de 35,0 m³ a 25,0 °C e 1,00 atm. Considere o aquecimento do balão, com expansão do volume para 50,0 m³, de tal forma que a pressão permaneceu constante. Nessa situação final, a temperatura do balão, em K, é (Dado: T(K) = T(°C) + 273)", [
 "152,7","218,1","340,6","425,7","510,8"])

add(24, "À luz da teoria de ácidos e bases de Brönsted-Lowry, conclui-se que um(a)", [
 "ácido mais forte tem maior tendência à transferência de um íon H⁺ do que um ácido mais fraco.",
 "ácido é a espécie com tendência de aceitar um íon H⁺.",
 "base é a espécie com tendência de transferir um íon H⁺.",
 "base mais forte tem menor tendência para aceitar um íon H⁺ do que uma base mais fraca.",
 "amina primária (–NH₂) é uma espécie ácida e transfere íons H⁺."])

add(25, "O PTFE é um fluoropolímero sintético com alta massa molecular, cujo precursor monomérico é o tetrafluoretileno (TFE). O PTFE é conhecido por ser antiaderente, ter alta estabilidade térmica e baixa reatividade química. Das estruturas a seguir, a que representa a unidade de repetição do PTFE é a" + FORM, [
 "–(CH₂–CH₂)ₙ– (polietileno)",
 "–(CHF–CHF)ₙ–",
 "–(CF₂–CF₂)ₙ– (politetrafluoretileno, PTFE)",
 "–(CH₂–CHF)ₙ–",
 "estrutura fluorada com átomo de oxigênio na cadeia"])

add(26, "O entendimento do efeito fotoelétrico, no início do século XX, desempenhou um papel crucial no desenvolvimento da teoria quântica e gerou avanços na compreensão da natureza elétrica da matéria. O princípio fundamental do efeito fotoelétrico consiste na", [
 "emissão de luz quando elétrons colidem com átomos de uma superfície metálica.",
 "ejeção de elétrons de uma superfície metálica quando ela é exposta à luz.",
 "reflexão total da luz em uma superfície metálica.",
 "refração total da luz em uma superfície transparente.",
 "produção de um campo elétrico em resposta à luz incidida."])

add(27, "Considere um sistema de equações que envolvem reações de hidrocarbonetos" + FIG + "\n\nAs substâncias X, Y e Z são, respectivamente", [
 "CH₃Cl, CH₄, HONO₂","CH₃Cl, HONO₂, CH₄","CH₄, HONO₂, CH₃Cl","CH₄, CH₃Cl, HONO₂","HONO₂, CH₄, CH₃Cl"])

add(28, "Um carrinho utilizado na movimentação de cargas em um armazém é puxado do repouso até uma velocidade de 2,0 m/s em 4 segundos e com movimento uniformemente variado. A distância, em metros, percorrida pelo carrinho durante esse tempo é", [
 "2","4","6","8","10"])

add(29, "Uma viga de seção transversal retangular de dimensões b × h é submetida a um momento fletor M, conforme indicado na Figura." + FIG + "\n\nA tensão normal compressiva máxima na seção mostrada atuará no(s) ponto(s)", [
 "A, apenas","B, apenas","A e D","A e B","B e C"])

add(30, "O descarregamento de uma caixa de massa m é realizado com o deslizamento da caixa por um plano inclinado de α graus (10° < α < 30°), conforme mostrado na Figura, com atrito nulo entre a caixa e o plano." + FIG + "\n\nSendo g a aceleração da gravidade, a aceleração de deslizamento da caixa sobre o plano", [
 "é nula.","é igual a g.","independe do ângulo α.","independe da massa da caixa.","é proporcional à massa da caixa."])

add(31, "Na Figura, representa-se uma força concentrada F, aplicada à extremidade da viga biapoiada ABCD, com o objetivo de elevar uma carga posicionada conforme indicado." + FIG + "\n\nO menor valor da força F, expressa em newtons, para elevar uma carga P de 2.100 N, que faz com que a reação no apoio A seja nula, é", [
 "525","700","1.575","1.050","2.100"])

add(32, "A estrutura representada na Figura é constituída de 3 barras unidas pelo pino B. Considere que as barras 1 e 2 tenham área de seção transversal de 1,0 cm², e a barra 3, área de 1,2 cm²." + FIG + "\n\nAs tensões normais que atuam nas barras 1, 2 e 3 para suportar a carga P de 2.400 N são, em MPa, respectivamente, de", [
 "20 (compressão), 24 (compressão) e 24 (tração)",
 "20 (tração), 20 (compressão) e 24 (tração)",
 "24 (compressão), 24 (tração) e 20 (compressão)",
 "24 (compressão), 24 (compressão) e 20 (tração)",
 "24 (compressão), 24 (compressão) e 24 (tração)"])

add(33, "O Sistema Internacional de Unidades (SI) admite a utilização de múltiplos e submúltiplos das unidades. Uma força de 1,0 kN que atua no sentido de comprimir uma barra cuja seção transversal é de 5,0 cm² provocará uma tensão normal compressiva, expressa em MPa, de", [
 "0,1","0,2","1,0","2,0","10,0"])

add(34, "Todo processo de transformação do estado de uma determinada substância em uma cadeia de processamento, para a composição de um produto final, envolve operações que necessitam de controle, a fim de manter algumas grandezas dentro de valores pré-estabelecidos. A vazão é uma das principais variáveis desse tipo de processo e pode ser medida utilizando-se um medidor de vazão por área variável, no qual um flutuador varia sua posição dentro de um tubo cônico, proporcionalmente à vazão do fluido. Esse tipo de medidor é denominado", [
 "célula capacitiva","manômetro","placa orifício","rotâmetro","tubo Venturi"])

add(35, "Considere uma força magnética atuando em um condutor retilíneo de comprimento l, percorrido por uma corrente i. Esse condutor está imerso em uma região onde existe um campo magnético uniforme (B), que forma um ângulo θ com o condutor. Essa força magnética é representada pela seguinte equação:" + FORM, [
 "F = B i l sen θ",
 "F = B i sen θ",
 "F = B i l cos θ",
 "F = B i l tan θ",
 "F = B i l"])

add(36, "Um técnico atuante na área de óleo e gás deve ter conhecimento dos riscos inerentes ao trabalho de extração, refino e manipulação de petróleo e de seus derivados. Um conhecimento muito importante é sobre os sistemas instrumentados de segurança que operam acima da camada de controle de processo e que atuam na presença de falha de algum componente ou do desvio dos limites toleráveis de operação do processo, garantindo a segurança dos trabalhadores e das instalações. O nível de integridade de segurança (SIL) que oferece o maior nível de redução do fator de risco é o", [
 "0","3","4","5","6"])

add(37, "A partir de dois métodos de conversão de sinal — método de equilíbrio de força e método de equilíbrio de movimento — são fabricados os tipos de transmissores", [
 "eletrônicos e analógicos","digitais","inteligentes","pneumáticos","smart"])

add(38, "Em metrologia, há um conceito associado ao conjunto de condições que incluem o mesmo procedimento de medição, os mesmos operadores, o mesmo sistema de medição, as mesmas condições de operação e o mesmo local de medição. Trata-se do conceito de condições de", [
 "abrangência","aleatoriedade","definibilidade","repetibilidade","reprodutibilidade"])

add(39, "O dispositivo representado na Figura é um tubo de Venturi, que compreende duas seções, a maior com área S1, e a menor, com área S2, ambas conhecidas. Nas direções verticais correspondentes aos pontos P1 e P2, são conectados dois tubos verticais, ambos com as extremidades superiores abertas e as inferiores em comunicação com o interior desse tubo, por onde um fluido conhecido é canalizado. Considere que v1 é a velocidade na região S1; v2, a velocidade na região S2 (garganta); e Δh, a medida do desnível do líquido existente nos tubos verticais." + FIG + "\n\nEsse dispositivo é usado para medir", [
 "calor","temperatura absoluta","temperatura relativa","vazão","viscosidade"])

add(40, "O recipiente cilíndrico de diâmetro igual a 12 m, representado na Figura, é aberto no topo e contém água, cuja densidade é igual a 1.000 kg/m³, até a linha indicada. O nível da água no interior do reservatório está a uma altura h1 = 10,8 m, e a tubulação de saída, um duto circular com 20 cm² de área de seção reta, está a uma altura h2 = 9 m." + FIG + "\n\nConsiderando-se a situação apresentada, a vazão de saída de água, em kg/s, é igual a (Dado: g = 10 m/s²)", [
 "0,012","0,12","1,2","12","120"])

add(41, "O dióxido de enxofre é um gás razoavelmente solúvel em água, sendo usado para a produção industrial de ácido sulfúrico. Uma matéria prima contendo enxofre elementar sofreu uma reação na presença de excesso de gás oxigênio, para formar 50.000 L do gás SO₂, medido nas condições normais de temperatura e pressão (CNTP) e assumindo comportamento ideal dos gases, como mostrado na reação: S(s) + O₂(g) → SO₂(g). A reação do enxofre foi completa, e a massa da matéria prima era 80,0 kg. A partir dessa informação, a percentagem, em massa, de enxofre elementar na matéria prima é, aproximadamente, (Dado: R = 0,082 atm L mol⁻¹ K⁻¹)", [
 "25%","36%","44%","73%","82%"])

add(42, "Ao se inserir um pedaço de ferro metálico em uma solução aquosa de sulfato de cobre, observa-se a formação espontânea de uma camada acobreada na superfície da placa de ferro. Sobre essa reação, verifica-se que o", [
 "Fe(s) sofre oxidação.",
 "processo envolve 1 mol de elétrons por 1 mol de Fe(s) reagido.",
 "Cu²⁺(aq) perde elétrons.",
 "Cu(s) reduz formando Cu²⁺(aq).",
 "potencial padrão de redução do Cu(s) é menor do que o do Fe(s)."])

add(43, "A decomposição do carbonato de cálcio produz CO₂, como representado na reação termoquímica: CaCO₃(s) → CaO(s) + CO₂(g); ΔH⁰ = +179 kJ. Considerando-se o comportamento ideal do gás e o rendimento máximo da reação, a energia necessária, em MJ, para produzir 36 m³ de CO₂, medido nas condições normais de temperatura e pressão (CNTP) é, aproximadamente, (Dados: R × T = 24,4 atm L mol⁻¹; M = 106)", [
 "-132","-179","+132","+264","+528"])

add(44, "Uma solução comercial de um algicida contém 30 g de cloreto de N,N-2-metil propilamônio em 100 mL de solução. Para tratar situações de elevada formação de algas, a receita é separar uma alíquota de 5,0 mL da solução comercial, diluindo em água para formar 4,0 L de solução final. A concentração do princípio ativo, em g L⁻¹, dessa solução final é, aproximadamente,", [
 "0,15","0,26","0,38","0,52","0,90"])

add(45, "Uma solução aquosa de hidróxido de sódio tem densidade igual a 1,40 g mL⁻¹ e 40% de teor do soluto, em massa. A concentração, em mol L⁻¹, do hidróxido na solução é (Dado: M(NaOH) = 40 g mol⁻¹)", [
 "4","8","10","14","16"])

add(46, "O bicarbonato de sódio (NaHCO₃) é um reagente usado para finalidades diversas por conta de sua capacidade para neutralização de ácidos e para produção do gás CO₂. Em contato com soluções aquosas ácidas, reage como representado: NaHCO₃(s) + H₃O⁺(aq) → Na⁺(aq) + 2H₂O(l) + CO₂(g). Considerando-se a proporção estequiométrica e o rendimento completo de reação, a massa de bicarbonato de sódio necessária para neutralizar 20,0 L de solução aquosa, cujo pH medido foi 2, é", [
 "8,4","16,8","24,6","33,6","40,2"])

add(47, "Nanopartículas de prata (AgNP) são nanoestruturas contendo algumas centenas de átomos de Ag, cuja superfície apresenta carga elétrica que as mantém dispersas em meio aquoso. Baseado no tamanho e no grau de espalhamento de luz incidente, calculou-se em 1 × 10⁻⁵ mol L⁻¹ a concentração de AgNP na dispersão. A partir do tamanho médio, determinou-se que haveria 500 átomos de Ag por nanopartícula. Considerando-se esses dados, verifica-se que a massa de prata, em mg, presente em 1 mL de dispersão é (Dados: 1 mol = 6 × 10²³ unidades; M(Ag) = 108 g mol⁻¹)", [
 "0,028","0,054","0,14","0,28","0,54"])

add(48, "A protonação de uma amina biogênica requer absorção de calor, atingindo uma situação de equilíbrio no meio aquoso, como descrito na reação: H₂N-CH₂-CH₂-CH₂-CH₂-NH₂(aq) + 2 H⁺(aq) ⇌ ⁺H₃N-CH₂-CH₂-CH₂-CH₂-NH₃⁺(aq). Nesse sistema, verifica-se que o(a)", [
 "aumento da concentração de H⁺ deslocaria a reação para a formação de ⁺H₃N-CH₂-CH₂-CH₂-CH₂-NH₃⁺.",
 "resfriamento da solução deslocaria a reação para a formação de ⁺H₃N-CH₂-CH₂-CH₂-CH₂-NH₃⁺.",
 "equilíbrio não dependeria do pH do meio.",
 "constante de equilíbrio seria K = [⁺H₃N-CH₂-CH₂-CH₂-CH₂-NH₃⁺]/[H⁺]².",
 "diluição da solução com água não perturbaria o equilíbrio."])

add(49, "Se um sensor analógico de nível transmitir um sinal elétrico em tensão de 1 Vcc a 6 Vcc para um range de 0,7 m a 2,2 m, qual deverá ser a sensibilidade, em Vcc/m, desse sensor?", [
 "2,27","2,73","4,00","4,67","3,33"])

add(50, "Um cilindro longo de um material de condutividade térmica k, comprimento L e raio da seção reta R, está colocado entre uma fonte fria à temperatura TF e uma fonte quente à temperatura TQ. O fluxo estacionário de calor que passa por esse cilindro é J1. Um outro cilindro, feito de outro material, com condutividade térmica k/2, comprimento 4L e raio de seção reta 4R, é colocado entre as mesmas fontes, fria e quente. Para esse segundo cilindro, o fluxo estacionário de calor é J2. A relação entre os fluxos estacionários de calor, J2/J1, é igual a", [
 "16","4","2","1","1/2"])

add(51, "Em um acelerador eletrostático linear, com comprimento igual a 6,0 m, prótons são acelerados a partir do repouso até uma velocidade final de 4,0 × 10⁶ m/s. Qual é a diferença de potencial, em kV, na qual esse acelerador opera? (Dados: carga elétrica do próton = 1,6 × 10⁻¹⁹ C; massa do próton = 1,7 × 10⁻²⁷ kg)", [
 "8,5","17","34","85","170"])

add(52, "Uma máquina térmica reversível realiza trabalho em ciclos, de modo que retira 240 J de uma fonte quente a 627 °C e rejeita 80 J em uma fonte fria à temperatura TF. Qual é, em °C, a temperatura TF?", [
 "-273","27","327","627","900"])

add(53, "A energia interna de um gás ideal diatômico depende apenas de sua temperatura. Esse gás ideal passa por um processo isotérmico, em contato com uma fonte térmica à temperatura T. Observa-se que ele realiza um trabalho total de 350 J sobre o meio ambiente. O calor trocado pelo gás com a fonte térmica T é igual a", [
 "175 J, e o calor é rejeitado pelo gás.",
 "175 J, e o calor é absorvido pelo gás.",
 "350 J, e o calor é rejeitado pelo gás.",
 "350 J, e o calor é absorvido pelo gás.",
 "700 J, e o calor é rejeitado pelo gás."])

add(54, "Um grande imã gera, em uma região do espaço, um campo magnético uniforme, orientado verticalmente para cima. Um feixe de elétrons é lançado horizontalmente, nessa região. Logo após entrar nessa região, esse feixe de elétrons é", [
 "acelerado, mantendo sua direção original.",
 "freado, mantendo sua direção original.",
 "defletido verticalmente para cima.",
 "defletido verticalmente para baixo.",
 "defletido no plano horizontal, perpendicularmente à direção de sua velocidade."])

add(55, "Uma partícula pontual A, de massa 1,5 × 10⁻⁶ g, tem carga elétrica igual a +2,0 × 10⁻⁶ C e está fixa na origem do eixo x. Na posição x = +4,0 cm, encontra-se outra partícula pontual B, com metade da massa e o dobro da carga elétrica da partícula A. O módulo, em newtons, e o sentido da força elétrica sentida pela partícula A devido à partícula B são, respectivamente, (Dado: constante elétrica k = 9,0 × 10⁹ N m²/C²)", [
 "22,5, sentido negativo de x",
 "45, sentido negativo de x",
 "22,5, sentido positivo de x",
 "45, sentido positivo de x",
 "nulos, já que o efeito das massas anula a força elétrica"])

add(56, "Na Figura, são mostrados 3 vasos, A, B e C, abertos para a atmosfera. Esses vasos têm formas diferentes, mas foram preenchidos com água até o mesmo nível." + FIG + "\n\nA relação entre as pressões no fundo de cada um deles é descrita por", [
 "PB > PA > PC","PB = PA > PC","PB = PA = PC","PB > PA = PC","PB < PA < PC"])

add(57, "Na Tabela são apresentadas algumas características termodinâmicas de um ciclo ideal de refrigeração por compressão de vapor: calor trocado no evaporador = 120 kJ/kg; capacidade = 4,8 kW; trabalho do compressor = 40 kJ/kg; razão de circulação do refrigerante = 0,04 kg/s. Com base nessas características, qual é o valor do coeficiente de eficácia desse ciclo?", [
 "0,12","4,80","3,00","0,33","1,60"])

add(58, "Um técnico precisava trocar um medidor de vazão e consultou o almoxarifado sobre a disponibilidade desse tipo de instrumento. Sabendo-se que o medidor que será substituído é do tipo direto mássico, que medidor de vazão esse técnico deverá receber do almoxarifado?", [
 "Coriolis","Bocal de vazão","Placa de orifício","Tubo de Pitot","Tubo de Venturi"])

add(59, "Um sistema de primeira ordem, como, por exemplo, um sistema para controle de nível, apresenta a seguinte função de transferência: G(s) = 25/(s + 25). Qual é o valor, em segundos, da constante de tempo desse sistema?", [
 "0,01","0,02","0,03","0,04","0,05"])

add(60, "As bombas industriais podem ser classificadas em dois grandes grupos: as bombas dinâmicas e as bombas volumétricas, cada um com seus subgrupos. A bomba que corresponde a uma bomba volumétrica do tipo rotativa é a", [
 "centrífuga","de pistão","de êmbolo","de diafragma","de palhetas deslizantes"])

def discipline_of(n):
    if 1 <= n <= 10: return "Língua Portuguesa"
    if 11 <= n <= 20: return "Matemática"
    return "Conhecimentos Específicos"

assert sorted(Q.keys()) == list(range(1,61)), "faltam questoes: %s" % (set(range(1,61))-set(Q))
assert sorted(GAB.keys()) == list(range(1,61))

questions = []
for n in range(1,61):
    stmt, opts = Q[n]
    assert len(opts) == 5, "Q%d nao tem 5 alternativas" % n
    letters = ["A","B","C","D","E"]
    questions.append({
        "question_number": n,
        "discipline": discipline_of(n),
        "topic": None,
        "statement": stmt.strip(),
        "options": {letters[i]: opts[i].strip() for i in range(5)},
        "correct_answer": GAB[n],
        "explanation": None,
        "explanation_source": None,
        "source": "Cesgranrio — Transpetro 2023 — Prova 2 (Dutos e Terminais) — Gabarito definitivo",
        "year": 2023,
        "bank": "Cesgranrio",
    })

data = {
  "exam": {
    "slug": "transpetro-2023-dutos-e-terminais",
    "name": "Transpetro 2023 — Dutos e Terminais",
    "organization": "Transpetro",
    "bank": "Cesgranrio",
    "year": 2023,
    "category": "Dutos e Terminais",
    "description": "Processo Seletivo Público Transpetro/PSP/TERRA/Nível Médio 2023 — Prova 2, Profissional de Nível Médio, ênfase Dutos e Terminais. Aplicada em 29/09/2023. 10 questões de Língua Portuguesa, 10 de Matemática e 40 de Conhecimentos Específicos. Gabarito definitivo (Q49 alterada por recurso para E).",
    "total_questions": 60,
    "is_real_exam": True
  },
  "questions": questions
}

with open("content/transpetro-2023.json","w",encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("OK -> content/transpetro-2023.json  (%d questoes)" % len(questions))
