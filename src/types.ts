export type Prioridade = "alta" | "media" | "superado";
export type OrigemValida = "desconhecimento" | "confusao" | "esquecimento" | "interpretacao";
/** "" = registro antigo ainda não classificado */
export type Origem = OrigemValida | "";
export type OrigemKey = OrigemValida | "nc";

export interface HistItem {
  d: string;
  tipo: "criado" | "prioridade" | "origem" | "revisao" | "editado";
  de?: string;
  para?: string;
}

export interface Erro {
  id: string;
  materia: string;
  topico: string;
  descricao: string;
  correcao: string;
  comoEvitar: string;
  referencia: string;
  origem: Origem;
  prioridade: Prioridade;
  dataRegistro: string;
  criadoEm: string;
  atualizadoEm?: string;
  superadoEm?: string;
  ultimaRevisao?: string;
  revisoes: number;
  historico: HistItem[];
  exemplo?: boolean;
}

/** matéria → tópicos */
export type Catalogo = Record<string, string[]>;

export type SyncState = "local" | "connecting" | "synced" | "pending" | "offline" | "error";

export type View = "dashboard" | "erros" | "ciclo" | "evolucao" | "materias" | "backup";

export interface Filtros {
  q: string;
  materia: string;
  topico: string;
  prioridade: "" | Prioridade;
  origem: "" | OrigemKey;
  de: string;
  ate: string;
}

export const FILTROS_VAZIOS: Filtros = { q: "", materia: "", topico: "", prioridade: "", origem: "", de: "", ate: "" };
