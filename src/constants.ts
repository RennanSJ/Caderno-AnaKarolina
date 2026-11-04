import type { Catalogo, OrigemKey, OrigemValida, Prioridade } from "./types";
import type { IconName } from "./components/Icon";

export const DONA = "Ana Karolina";

export const PRIO: Record<Prioridade, { nome: string; curto: string; desc: string; icon: IconName; cor: string; soft: string }> = {
  alta: {
    nome: "Prioridade alta", curto: "Alta", icon: "alert", cor: "var(--alta)", soft: "var(--alta-soft)",
    desc: "Erros persistentes, conceitos que ainda não domino ou questões que continuo errando mesmo depois de estudar."
  },
  media: {
    nome: "Prioridade média", curto: "Média", icon: "flag", cor: "var(--media)", soft: "var(--media-soft)",
    desc: "Erros que já compreendi, mas merecem atenção para não se repetirem."
  },
  superado: {
    nome: "Superado", curto: "Superado", icon: "trophy", cor: "var(--sup)", soft: "var(--sup-soft)",
    desc: "Erros que já corrigi, compreendi e demonstrei domínio com novas questões."
  }
};
export const PRIO_KEYS: Prioridade[] = ["alta", "media", "superado"];

export interface OrigemInfo { nome: string; desc: string; ex: string; icon: IconName; cor: string; soft: string; dica: string }

export const ORIG: Record<OrigemValida, OrigemInfo> = {
  desconhecimento: {
    nome: "Desconhecimento", icon: "help", cor: "var(--o-desc)", soft: "var(--o-desc-soft)",
    desc: "Nunca havia estudado o conceito, termo ou conteúdo.", ex: "Ex.: nunca tinha ouvido falar em modularidade.",
    dica: "Seu ponto de melhoria é cobertura de conteúdo: confira o edital e preencha as lacunas de teoria antes de fazer mais questões."
  },
  confusao: {
    nome: "Confusão entre conceitos", icon: "shuffle", cor: "var(--o-conf)", soft: "var(--o-conf-soft)",
    desc: "Conhecia os conceitos, mas confundi um com o outro.", ex: "Ex.: anulação x revogação.",
    dica: "Monte quadros comparativos lado a lado dos institutos parecidos e revise as diferenças, não só as definições."
  },
  esquecimento: {
    nome: "Esquecimento", icon: "clock", cor: "var(--o-esq)", soft: "var(--o-esq-soft)",
    desc: "Já havia estudado, mas não lembrei no momento da questão.", ex: "Ex.: um prazo ou uma exceção legal.",
    dica: "O conteúdo você já tem: aumente a frequência das revisões e use flashcards para prazos e exceções."
  },
  interpretacao: {
    nome: "Erro de interpretação", icon: "text", cor: "var(--o-int)", soft: "var(--o-int-soft)",
    desc: "Conhecia o conteúdo, mas interpretei mal o enunciado ou as alternativas.", ex: "Ex.: não perceber que pedia a alternativa incorreta.",
    dica: "Treine leitura ativa: grife o comando da questão (correta, incorreta, exceto) e leia todas as alternativas antes de marcar."
  }
};
export const ORIG_KEYS: OrigemValida[] = ["desconhecimento", "confusao", "esquecimento", "interpretacao"];
export const NAO_CLASSIFICADO: OrigemInfo = {
  nome: "Não classificado", icon: "dash", cor: "var(--o-nc)", soft: "var(--o-nc-soft)", desc: "", ex: "", dica: ""
};
export const origemInfo = (k: OrigemKey): OrigemInfo => (k === "nc" ? NAO_CLASSIFICADO : ORIG[k]);

/** Edital verticalizado do TJSP, cargo Escrevente Técnico Judiciário: matéria → tópicos. */
export const EDITAL_NOME = "TJSP — Escrevente Técnico Judiciário";
const NC = "Normas da Corregedoria — Tomo I";
export const EDITAL_TJSP: Catalogo = {
  "Língua Portuguesa": [
    "Análise, compreensão e interpretação de diversos tipos de textos verbais, não verbais, literários e não literários",
    "Informações literais e inferências possíveis",
    "Ponto de vista do autor",
    "Estruturação do texto: relações entre ideias; recursos de coesão",
    "Significação contextual de palavras e expressões",
    "Sinônimos e antônimos",
    "Sentido próprio e figurado das palavras",
    "Classes de palavras: emprego e sentido (substantivo, adjetivo, artigo, numeral, pronome, verbo, advérbio, preposição e conjunção)",
    "Concordância verbal e nominal",
    "Regência verbal e nominal",
    "Colocação pronominal",
    "Crase",
    "Pontuação"
  ],
  "Direito Processual Civil": [
    "CPC — artigos 1º a 11; 13 a 18; 21 a 27; 36; 42 a 53",
    "CPC — artigos 64 a 66; 70 a 85; 98 a 102; 110 a 111",
    "CPC — artigos 125 a 135; 139 a 143; 149 a 155; 159 a 161",
    "CPC — artigos 176 a 199; 203 a 259; 269 a 275",
    "CPC — artigos 447 a 449; 453 a 454; 502; 528; 535 a 536; 538",
    "CPC — artigos 554; 560 a 563; 626; 695; 751; 782; 795",
    "CPC — artigos 806 a 807; 827 a 846; 870 a 875",
    "CPC — artigos 994; 1.001; 1.003; 1.009; 1.010; 1.015; 1.022",
    "Lei n.º 9.099/1995 — artigos 1º; 2º; 8º; 9º; 18; 19; 60 a 62; 66 a 68"
  ],
  "Direito Constitucional": [
    "CF — artigos 1º a 16 (Princípios Fundamentais e Direitos Fundamentais)",
    "CF — artigo 18 (Organização Político-Administrativa)",
    "CF — artigos 37 a 41 (Administração Pública)",
    "CF — artigos 92 a 99 (Poder Judiciário)",
    "CF — artigos 125; 127; 134"
  ],
  "Direito Administrativo": [
    "Estatuto dos Funcionários Públicos Civis do Estado de SP (Lei n.º 10.261/68) — artigos 1º; 3º; 4º; 11; 13; 14",
    "Lei n.º 10.261/68 — artigos 46; 47; 57; 78; 110; 120; 127; 176; 241 a 243; 251",
    "Lei Federal n.º 8.429/92 (Improbidade Administrativa) — artigos 9º e 13"
  ],
  "Direito Civil": [
    "CC — artigos 1º a 25 (Das Pessoas); 40 a 45; 49 a 50; 53; 62",
    "CC — artigos 70 a 103 (Domicílio e Bens)",
    "CC — artigos 115 a 120; 138 a 159 (Validade dos Negócios Jurídicos)",
    "CC — artigos 166 a 201; 212 a 215",
    "CC — artigos 653 a 666 (Mandato)",
    "CC — artigos 1.169 a 1.173; 1.196 a 1.203",
    "CC — artigos 1.431 a 1.432; 1.442; 1.444 a 1.447; 1.451; 1.461; 1.467 a 1.472",
    "CC — artigos 1.728; 1.767; 1.775 a 1.778; 1.997",
    "Decreto-Lei n.º 4.657, de 04/09/1942 (LINDB)"
  ],
  "Direito Penal": [
    "CP — artigos 1º a 12 (Aplicação da Lei Penal)",
    "CP — artigos 100 a 106 (Ação Penal)",
    "CP — artigos 107 a 121",
    "CP — artigos 129; 150; 154; 293 a 305; 307; 308; 311-A",
    "CP — artigos 312 a 317 (Crimes contra a Administração Pública)",
    "CP — artigos 319 a 333; 336 e 337; 339 a 347; 357 e 359"
  ],
  "Direito Processual Penal": [
    "CPP — artigos 24 a 42; 61 a 74; 112",
    "CPP — artigos 125 a 131; 156; 185; 202 a 204",
    "CPP — artigos 218 a 225; 240 a 250; 274",
    "CPP — artigos 283 a 303; 351 a 363; 370 a 372",
    "CPP — artigos 396 a 396-A; 406; 436 a 446",
    "CPP — artigos 485 a 487; 513 a 518; 563 a 570",
    "CPP — artigos 593; 647 a 654; 762 a 763; 792; 798 e 798-A",
    "Lei n.º 9.099/1995 — artigos 1º; 2º; 60 a 62; 66 a 68"
  ],
  "Legislação Especial": [
    "Lei n.º 11.608, de 29/12/2003",
    `${NC}, Cap. I: arts. 1º a 4º`,
    `${NC}, Cap. III, Seção III: art. 33`,
    `${NC}, Cap. III, Seção V: arts. 47; 49`,
    `${NC}, Cap. III, Seção XI: arts. 105 a 110`,
    `${NC}, Cap. IV, Seção III: art. 196, inciso XX`,
    `${NC}, Cap. IV, Seção IV: art. 282, § 1º`,
    `${NC}, Cap. IV, Seção VI: arts. 310; 315`,
    `${NC}, Cap. IV, Seção XII: art. 410`,
    `${NC}, Cap. IV, Seção XIII: arts. 436; 436-A`,
    `${NC}, Cap. IV, Seção XIV: arts. 439; 440; 440-A`,
    `${NC}, Cap. VII: arts. 994 a 1.091-A`,
    `${NC}, Cap. X, Seção III: arts. 1.137 a 1.139`,
    `${NC}, Cap. XI, Seção VII: arts. 1.245; 1.247`
  ],
  "Atualidades": [
    "Fatos políticos, econômicos, sociais e culturais, nacionais e internacionais, divulgados a partir do 1º semestre de 2026",
    "Lei n.º 13.146/2015 (Estatuto da Pessoa com Deficiência) — artigos 1º a 13; 34 a 38; 79 a 87"
  ],
  "Matemática e Raciocínio Lógico": [
    "Operações com números reais",
    "Mínimo múltiplo comum e máximo divisor comum",
    "Razão e proporção",
    "Porcentagem",
    "Regra de três simples e composta",
    "Média aritmética simples e ponderada",
    "Juros simples",
    "Equação do 1º e 2º graus",
    "Sistema de equações do 1º grau",
    "Relação entre grandezas: tabelas e gráficos",
    "Sistemas de medidas usuais",
    "Noções de geometria: forma, perímetro, área, volume, ângulo, teorema de Pitágoras",
    "Resolução de situações-problema",
    "Raciocínio Lógico: estrutura lógica das relações arbitrárias entre pessoas, lugares, coisas e eventos fictícios; dedução de novas informações; avaliação das condições; regularidades de sequências; estruturas lógicas; lógicas de argumentação; diagramas lógicos; sequências"
  ],
  "Informática": [
    "MS-Windows 10 ou superior: pastas, diretórios, arquivos e atalhos; área de trabalho e de transferência; manipulação de arquivos; menus, programas e aplicativos; Microsoft 365",
    "MS-Word: estrutura básica dos documentos; edição e formatação de textos; cabeçalhos, parágrafos, fontes, colunas; marcadores simbólicos e numéricos; tabelas; impressão; quebras e numeração de páginas; legendas, índices; inserção de objetos, campos predefinidos, caixas de texto",
    "MS-Excel: estrutura básica das planilhas; células, linhas, colunas, pastas e gráficos; elaboração de tabelas e gráficos; fórmulas, funções e macros",
    "MS-Teams: chats, chamadas de áudio e vídeo; criação de grupos; trabalho em equipe; agendamento de reuniões e gravação",
    "OneDrive: armazenamento e compartilhamento de arquivos",
    "Correio eletrônico: preparo e envio de mensagens; anexação de arquivos",
    "Internet: navegação; conceitos de URL, links, sites; busca e impressão de páginas"
  ]
};

export const MATERIAS_SUGERIDAS = Object.keys(EDITAL_TJSP);

export const FRASES = [
  "Cada erro corrigido é um passo a mais em direção à aprovação.",
  "Você não precisa ser perfeito hoje. Precisa ser melhor do que ontem.",
  "Quem aprende com os próprios erros chega mais preparado à prova.",
  "A aprovação é construída nos dias em que você decide não desistir.",
  "Não tenha medo de errar nas questões. Tenha compromisso em não repetir os mesmos erros.",
  "Seu concorrente pode estudar mais questões. Mas você pode aprender mais com cada uma delas.",
  "Disciplina é continuar mesmo quando a motivação não aparece.",
  "Errar no treino é o preço de acertar na prova.",
  "Constância vence intensidade. Um pouco todo dia leva longe.",
  "O erro que você registra hoje é a questão que você acerta amanhã.",
  "A posse não chega por sorte. Chega pela repetição bem feita.",
  "Cada revisão é um tijolo a mais na sua aprovação.",
  "Ninguém é aprovado sem antes ter errado muito. A diferença é o que se faz com o erro.",
  "Estudar cansado também conta. Desistir é que não conta.",
  "Seu caderno de erros é o mapa mais honesto do caminho até a aprovação.",
  "Pequenos avanços diários parecem nada. Somados, viram nomeação.",
  "Persistir é escolher de novo, todos os dias, o mesmo objetivo.",
  "Um erro entendido vale mais do que dez acertos no chute.",
  "Quem revisa os próprios erros transforma fraqueza em ponto forte.",
  "O edital é grande, mas você é maior do que ele quando não para.",
  "Superar um erro é provar para si mesmo que você evolui.",
  "A motivação te faz começar. A disciplina te faz chegar.",
  "Hoje é mais um dia de construção. A aprovação é a obra pronta.",
  "Não compare o seu capítulo 3 com o capítulo 20 de outra pessoa.",
  "Você está mais perto da aprovação do que estava ontem.",
  "Errou de novo? É sinal de que esse ponto merece atenção. Anote e siga.",
  "Concurso não premia quem nunca erra, premia quem não repete o erro.",
  "A sua vaga está sendo conquistada agora, em cada questão revisada.",
  "Cansaço passa. A aprovação fica para sempre.",
  "Grandes resultados nascem de rotinas comuns feitas com constância.",
  "Seja paciente com o processo e exigente com a revisão.",
  "Transformar erros em acertos é o que separa candidatos de aprovados.",
  "Cada tópico superado é uma porta a menos entre você e o cargo.",
  "Você não está atrasado. Está no seu ritmo, e ele está te levando adiante."
];
