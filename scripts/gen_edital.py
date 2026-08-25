# Gera supabase/migrations/0010_seed_edital.sql — árvore oficial do edital (Anexo IV) +
# mapeamento best-effort das 60 questões da prova 2023 (marcado para revisão).
import re

def slug(s):
    s=s.lower()
    for a,b in [("á","a"),("â","a"),("ã","a"),("é","e"),("ê","e"),("í","i"),("ó","o"),("ô","o"),("õ","o"),("ú","u"),("ç","c")]:
        s=s.replace(a,b)
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s

LP=["Compreensão de textos","Ortografia oficial","Mecanismos de coesão textual",
    "Emprego das classes de palavras","Concordância nominal e verbal",
    "Sinal indicativo de crase","Sinais de pontuação","Significação das palavras"]
MAT=["Conjuntos numéricos","Razão e proporção; porcentagem","Funções",
     "Equações e sistemas lineares","Análise combinatória","Probabilidade",
     "Estatística","Matemática financeira","Geometria plana","Geometria espacial"]
# CE: (grupo, [(code_n, nome)])
CE=[
 ("Medição e Metrologia",[(1,"Noções de metrologia"),(7,"Definições e unidades de medição"),
    (8,"Sistema Internacional de Unidades"),(9,"Instrumentos de medição (pressão, nível, temperatura, vazão)")]),
 ("Instrumentação e Controle",[(2,"Transmissão e transmissores"),(3,"Controle de processos (malha aberta e fechada)"),
    (4,"Elementos finais de controle"),(5,"Instrumentação: tipos, terminologia e simbologia"),
    (6,"Sistemas instrumentados de segurança")]),
 ("Mecânica",[(10,"Mecânica geral: estática, cinemática e dinâmica"),(11,"Conservação da energia mecânica")]),
 ("Mecânica dos Fluidos",[(12,"Mecânica dos fluidos: propriedades, hidrostática, escoamento e perda de carga")]),
 ("Térmica e Termodinâmica",[(13,"Transmissão de calor: condução, convecção e radiação"),
    (14,"Máquinas térmicas"),(16,"Termodinâmica básica")]),
 ("Resistência dos Materiais",[(15,"Resistência dos materiais: tensões, flexão e torção")]),
 ("Equipamentos de Processo",[(17,"Equipamentos de processo: bombas, compressores e permutadores")]),
 ("Segurança, Meio Ambiente e Saúde",[(18,"Segurança do trabalho, meio ambiente e saúde")]),
 ("Química",[(19,"Química geral: modelos atômicos e classificação periódica"),(20,"Ligações químicas"),
    (21,"Cálculo estequiométrico"),(22,"Estudo dos gases"),(23,"Reações de oxidação-redução"),
    (24,"Química inorgânica: ácidos, bases, sais e óxidos"),(25,"Química orgânica: hidrocarbonetos e polímeros"),
    (26,"Unidades de concentração"),(27,"Transformações químicas e equilíbrio"),(28,"Termoquímica"),
    (29,"Soluções aquosas"),(30,"Dispersões"),(31,"Natureza elétrica da matéria"),(32,"Operações unitárias")]),
 ("Processos de Refino",[(33,"Noções de processos de refino")]),
 ("Física e Eletromagnetismo",[(34,"Eletrostática"),(35,"Cargas elétricas em movimento"),
    (36,"Eletromagnetismo"),(37,"Radiações eletromagnéticas"),(38,"Noções de eletricidade e eletrônica")]),
]

# mapeamento questão -> nome do tópico (folha)
Q2T={
 1:"Compreensão de textos",2:"Compreensão de textos",3:"Mecanismos de coesão textual",
 4:"Emprego das classes de palavras",5:"Significação das palavras",6:"Mecanismos de coesão textual",
 7:"Mecanismos de coesão textual",8:"Sinal indicativo de crase",9:"Sinais de pontuação",10:"Concordância nominal e verbal",
 11:"Conjuntos numéricos",12:"Matemática financeira",13:"Estatística",14:"Funções",15:"Estatística",
 16:"Razão e proporção; porcentagem",17:"Razão e proporção; porcentagem",18:"Equações e sistemas lineares",
 19:"Geometria plana",20:"Equações e sistemas lineares",
 21:"Química geral: modelos atômicos e classificação periódica",22:"Ligações químicas",23:"Estudo dos gases",
 24:"Química inorgânica: ácidos, bases, sais e óxidos",25:"Química orgânica: hidrocarbonetos e polímeros",
 26:"Radiações eletromagnéticas",27:"Química orgânica: hidrocarbonetos e polímeros",
 28:"Mecânica geral: estática, cinemática e dinâmica",29:"Resistência dos materiais: tensões, flexão e torção",
 30:"Mecânica geral: estática, cinemática e dinâmica",31:"Mecânica geral: estática, cinemática e dinâmica",
 32:"Resistência dos materiais: tensões, flexão e torção",33:"Resistência dos materiais: tensões, flexão e torção",
 34:"Instrumentos de medição (pressão, nível, temperatura, vazão)",35:"Eletromagnetismo",
 36:"Sistemas instrumentados de segurança",37:"Transmissão e transmissores",38:"Noções de metrologia",
 39:"Instrumentos de medição (pressão, nível, temperatura, vazão)",
 40:"Mecânica dos fluidos: propriedades, hidrostática, escoamento e perda de carga",
 41:"Cálculo estequiométrico",42:"Reações de oxidação-redução",43:"Termoquímica",44:"Unidades de concentração",
 45:"Unidades de concentração",46:"Soluções aquosas",47:"Dispersões",48:"Transformações químicas e equilíbrio",
 49:"Instrumentação: tipos, terminologia e simbologia",50:"Transmissão de calor: condução, convecção e radiação",
 51:"Eletrostática",52:"Máquinas térmicas",53:"Termodinâmica básica",54:"Eletromagnetismo",55:"Eletrostática",
 56:"Mecânica dos fluidos: propriedades, hidrostática, escoamento e perda de carga",57:"Máquinas térmicas",
 58:"Instrumentos de medição (pressão, nível, temperatura, vazão)",59:"Controle de processos (malha aberta e fechada)",
 60:"Equipamentos de processo: bombas, compressores e permutadores",
}

out=["-- 0010_seed_edital.sql — árvore de tópicos (Anexo IV, oficial) + mapeamento das 60 questões.",
     "-- Mapeamento questão→tópico é best-effort contra a lista oficial (revisável).",""]
def ins_topic(disc, name, code, order, parent_name=None):
    e=lambda s:s.replace("'","''")
    p = "null" if not parent_name else f"(select id from public.topics where discipline_id=d.id and name='{e(parent_name)}')"
    code_sql = "null" if not code else f"'{code}'"
    return (f"insert into public.topics (discipline_id, name, parent_id, order_index, code)\n"
            f"select d.id, '{e(name)}', {p}, {order}, {code_sql} from public.disciplines d "
            f"where d.name='{e(disc)}' on conflict (discipline_id, name) do nothing;")

o=0
for n in LP: o+=1; out.append(ins_topic("Língua Portuguesa",n,f"LP-{o}",o))
o=0
for n in MAT: o+=1; out.append(ins_topic("Matemática",n,f"MAT-{o}",o))
# CE parents first
o=0
for grp,leaves in CE:
    o+=1; out.append(ins_topic("Conhecimentos Específicos",grp,None,o))
# CE leaves
for grp,leaves in CE:
    for code_n,nome in leaves:
        out.append(ins_topic("Conhecimentos Específicos",nome,f"CE-{code_n}",code_n,grp))

out.append("")
out.append("-- Mapeamento questão → tópico (prova 2023)")
for qn,tname in sorted(Q2T.items()):
    e=tname.replace("'","''")
    out.append(f"update public.questions set topic_id=(select id from public.topics where name='{e}' limit 1) "
               f"where exam_id=(select id from public.exams where slug='transpetro-2023-dutos-e-terminais') and question_number={qn};")

open("supabase/migrations/0010_seed_edital.sql","w").write("\n".join(out)+"\n")
print("linhas:", len(out), "| tópicos LP",len(LP),"MAT",len(MAT),"CE folhas",sum(len(l) for _,l in CE),"grupos",len(CE))
