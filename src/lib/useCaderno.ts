import { useCallback, useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { catWith, corpo } from "./caderno";
import { lsGet, lsSet } from "./utils";
import type { Catalogo, Erro, SyncState } from "../types";

type Notify = (msg: string, tipo?: "ok" | "erro" | "info") => void;

/** Garante que todo registro tenha os campos esperados, inclusive os antigos. */
function normalizar(raw: Record<string, unknown> & { id: string }): Erro {
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    ...(raw as unknown as Erro),
    materia: s(raw.materia), topico: s(raw.topico), descricao: s(raw.descricao),
    correcao: s(raw.correcao), comoEvitar: s(raw.comoEvitar), referencia: s(raw.referencia),
    origem: (s(raw.origem) as Erro["origem"]) || "",
    prioridade: (s(raw.prioridade) as Erro["prioridade"]) || "alta",
    dataRegistro: s(raw.dataRegistro), criadoEm: s(raw.criadoEm),
    revisoes: typeof raw.revisoes === "number" ? raw.revisoes : 0,
    historico: Array.isArray(raw.historico) ? (raw.historico as Erro["historico"]) : []
  };
}

const chave = (uid: string | null) => `caderno:${uid ?? "local"}`;
export const LOCAL_ERROS = "caderno:local:erros";

/**
 * Estado do caderno. Tudo é gravado no localStorage na hora.
 * Com login, o Firestore sincroniza com a conta: ele mantém um cache offline próprio
 * e envia as alterações pendentes quando a conexão volta.
 */
export function useCaderno(uid: string | null, notify: Notify) {
  const base = chave(uid);
  const [items, setItems] = useState<Erro[]>(() => lsGet<Erro[]>(`${base}:erros`, []));
  const [cat, setCat] = useState<Catalogo>(() => lsGet<Catalogo>(`${base}:catalogo`, {}));
  const [sync, setSync] = useState<SyncState>(uid && db ? "connecting" : "local");
  const [online, setOnline] = useState<boolean>(() => navigator.onLine);
  const catRef = useRef(cat);
  catRef.current = cat;
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  useEffect(() => lsSet(`${base}:erros`, items), [base, items]);
  useEffect(() => lsSet(`${base}:catalogo`, cat), [base, cat]);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (!uid || !db) return;
    const unsubErros = onSnapshot(
      collection(db, "users", uid, "erros"),
      { includeMetadataChanges: true },
      (snap) => {
        setItems(snap.docs.map((d) => normalizar({ ...(d.data() as Record<string, unknown>), id: d.id })));
        setSync(snap.metadata.hasPendingWrites ? "pending" : snap.metadata.fromCache ? "offline" : "synced");
      },
      () => setSync("error")
    );
    const unsubCat = onSnapshot(
      doc(db, "users", uid, "meta", "catalogo"),
      (snap) => {
        if (!snap.exists()) return;
        const m = (snap.data() as { materias?: unknown }).materias;
        if (m && typeof m === "object" && !Array.isArray(m)) setCat(m as Catalogo);
      },
      () => {}
    );
    return () => { unsubErros(); unsubCat(); };
  }, [uid]);

  const falha = useCallback((e: unknown) => {
    const code = (e as { code?: string })?.code || "";
    if (code === "permission-denied") notifyRef.current("A conta recusou a gravação. Confira as regras do Firestore no passo a passo.", "erro");
    else if (code === "resource-exhausted") notifyRef.current("O limite gratuito do Firebase foi atingido hoje. Os dados seguem neste aparelho.", "erro");
    else notifyRef.current("Não foi possível sincronizar agora. A alteração ficou salva neste aparelho.", "erro");
  }, []);

  const salvarCatalogo = useCallback((next: Catalogo) => {
    catRef.current = next;
    setCat(next);
    if (uid && db) setDoc(doc(db, "users", uid, "meta", "catalogo"), { materias: next }).catch(falha);
  }, [uid, falha]);

  const garantirNoCatalogo = useCallback((m: string, t?: string) => {
    const next = catWith(catRef.current, m, t);
    if (next) salvarCatalogo(next);
  }, [salvarCatalogo]);

  const salvar = useCallback((e: Erro) => {
    const item: Erro = { ...e, atualizadoEm: new Date().toISOString() };
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === item.id);
      if (i < 0) return [...prev, item];
      const n = [...prev];
      n[i] = item;
      return n;
    });
    garantirNoCatalogo(item.materia, item.topico);
    if (uid && db) setDoc(doc(db, "users", uid, "erros", item.id), corpo(item)).catch(falha);
  }, [uid, falha, garantirNoCatalogo]);

  const salvarVarios = useCallback(async (lista: Erro[]) => {
    if (!lista.length) return;
    const agora = new Date().toISOString();
    const novos = lista.map((e) => ({ ...e, atualizadoEm: agora }));
    setItems((prev) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      novos.forEach((n) => map.set(n.id, n));
      return [...map.values()];
    });
    let c = catRef.current;
    novos.forEach((n) => (c = catWith(c, n.materia, n.topico) || c));
    if (c !== catRef.current) salvarCatalogo(c);
    if (uid && db) {
      for (let i = 0; i < novos.length; i += 400) {
        const b = writeBatch(db);
        novos.slice(i, i + 400).forEach((n) => b.set(doc(db!, "users", uid, "erros", n.id), corpo(n)));
        b.commit().catch(falha);
      }
    }
  }, [uid, falha, salvarCatalogo]);

  const remover = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setItems((prev) => prev.filter((x) => !set.has(x.id)));
    if (uid && db) {
      if (ids.length === 1) deleteDoc(doc(db, "users", uid, "erros", ids[0])).catch(falha);
      else
        for (let i = 0; i < ids.length; i += 400) {
          const b = writeBatch(db);
          ids.slice(i, i + 400).forEach((id) => b.delete(doc(db!, "users", uid, "erros", id)));
          b.commit().catch(falha);
        }
    }
  }, [uid, falha]);

  const estado: SyncState = !uid || !db ? "local" : !online ? "offline" : sync;
  return { items, cat, sync: estado, salvar, salvarVarios, remover, salvarCatalogo, garantirNoCatalogo };
}

export type CadernoApi = ReturnType<typeof useCaderno>;
