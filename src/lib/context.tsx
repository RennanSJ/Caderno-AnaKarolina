import { createContext, useContext, type ReactNode } from "react";
import type { CadernoApi } from "./useCaderno";
import type { Erro, Filtros, View } from "../types";

export type ModalState =
  | { kind: "form"; erro?: Erro }
  | { kind: "detail"; id: string }
  | { kind: "review"; queue: string[]; idx: number }
  | { kind: "confirm"; title: string; body: ReactNode; okLabel: string; onOk: () => void | Promise<void> }
  | null;

export interface UiApi {
  notify: (msg: string, tipo?: "ok" | "erro" | "info") => void;
  abrir: (m: ModalState) => void;
  fechar: () => void;
  go: (v: View) => void;
  irParaTopico: (materia: string, topico: string) => void;
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  frase: string;
  novaFrase: () => void;
  temConta: boolean;
}

export type AppCtx = CadernoApi & UiApi;

const Ctx = createContext<AppCtx | null>(null);
export const AppProvider = ({ value, children }: { value: AppCtx; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp fora do AppProvider");
  return v;
}
