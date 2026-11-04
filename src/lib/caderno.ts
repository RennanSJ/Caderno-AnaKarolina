import { EDITAL_TJSP, ORIG, PRIO } from "../constants";
import type { Catalogo, Erro, Filtros, HistItem, OrigemKey, Prioridade } from "../types";
import { clone, findName, isIsoDate, norm, sortPt, today, uid } from "./utils";

export const prio = (e: Erro): Prioridade => (PRIO[e.prioridade] ? e.prioridade : "alta");
export const origOf = (e: Erro): OrigemKey => (e.origem && e.origem in ORIG ? e.origem : "nc");

export function logH(item: Erro, tipo: HistItem["tipo"], extra: Partial<HistItem> = {}) {
  item.historico = [...(item.historico || []), { d: today(), tipo, ...extra }].slice(-60);
}
export function setPrioridade(item: Erro, p: Prioridade) {
  if (item.prioridade === p) return;
  logH(item, "prioridade", { de: item.prioridade || "", para: p });
  item.prioridade = p;
  if (p === "superado") item.superadoEm = today();
  else delete item.superadoEm;
}

/* ---------- catálogo sem duplicação ---------- */
export function allMaterias(items: Erro[], cat: Catalogo): string[] {
  const out: string[] = [];
  [...Object.keys(cat), ...items.map((e) => e.materia)].forEach((m) => {
    if (m && !findName(out, m)) out.push(m);
  });
  return out.sort(sortPt);
}
export function topicsFor(items: Erro[], cat: Catalogo, m: string): string[] {
  if (!m) return [];
  const out: string[] = [];
  const key = findName(Object.keys(cat), m);
  [...(key ? cat[key] : []), ...items.filter((e) => norm(e.materia) === norm(m)).map((e) => e.topico)].forEach((t) => {
    if (t && !findName(out, t)) out.push(t);
  });
  return out.sort(sortPt);
}
export const canonMateria = (items: Erro[], cat: Catalogo, m: string) => findName(allMaterias(items, cat), m) || m.trim();
export const canonTopico = (items: Erro[], cat: Catalogo, m: string, t: string) => findName(topicsFor(items, cat, m), t) || t.trim();

/** Retorna um novo catálogo com a matéria/tópico, ou null se nada mudou. */
export function catWith(cat: Catalogo, m: string, t?: string): Catalogo | null {
  if (!m) return null;
  const next: Catalogo = { ...cat };
  let key = findName(Object.keys(next), m);
  let changed = false;
  if (!key) {
    key = m;
    next[key] = [];
    changed = true;
  }
  if (t && !findName(next[key], t)) {
    next[key] = [...next[key], t];
    changed = true;
  }
  return changed ? next : null;
}

/** Tópicos do catálogo e dos erros, mais os do edital para a matéria, sem duplicar. */
export function topicosComEdital(items: Erro[], cat: Catalogo, m: string): string[] {
  const out = topicsFor(items, cat, m);
  if (!m) return out;
  const key = findName(Object.keys(EDITAL_TJSP), m);
  (key ? EDITAL_TJSP[key] : []).forEach((t) => {
    if (!findName(out, t)) out.push(t);
  });
  return out.sort(sortPt);
}

/**
 * Junta um catálogo externo (ex.: o edital) ao do caderno.
 * Mantém a grafia que já existe e não duplica nomes com acento ou maiúscula diferentes.
 */
export function mesclarCatalogo(items: Erro[], cat: Catalogo, extra: Catalogo) {
  let next = cat;
  let materias = 0, topicos = 0;
  Object.entries(extra).forEach(([m, ts]) => {
    if (!findName(allMaterias(items, next), m)) materias++;
    const cm = canonMateria(items, next, m);
    next = catWith(next, cm) || next;
    ts.forEach((t) => {
      if (!findName(topicsFor(items, next, cm), t)) topicos++;
      next = catWith(next, cm, canonTopico(items, next, cm, t)) || next;
    });
  });
  return { next, materias, topicos, mudou: next !== cat };
}

/* ---------- agregações ---------- */
export interface Contagem { total: number; alta: number; media: number; superado: number; materias: number; pct: number }
export function counts(list: Erro[]): Contagem {
  const c = { total: list.length, alta: 0, media: 0, superado: 0, materias: 0, pct: 0 };
  list.forEach((e) => c[prio(e)]++);
  c.materias = new Set(list.map((e) => e.materia).filter(Boolean)).size;
  c.pct = c.total ? Math.round((c.superado / c.total) * 100) : 0;
  return c;
}
export interface Bloco { alta: number; media: number; superado: number; total: number }
const bloco = (): Bloco => ({ alta: 0, media: 0, superado: 0, total: 0 });
export function byMateria(items: Erro[]) {
  const m: Record<string, Bloco & { topicos: Record<string, Bloco> }> = {};
  items.forEach((e) => {
    const k = e.materia || "Sem matéria";
    const t = e.topico || "Sem tópico";
    if (!m[k]) m[k] = { ...bloco(), topicos: {} };
    if (!m[k].topicos[t]) m[k].topicos[t] = bloco();
    const p = prio(e);
    m[k][p]++; m[k].total++;
    m[k].topicos[t][p]++; m[k].topicos[t].total++;
  });
  return m;
}
export function topTopicos(items: Erro[], soAbertos: boolean) {
  const t: Record<string, Bloco & { materia: string; topico: string }> = {};
  items.forEach((e) => {
    if (soAbertos && prio(e) === "superado") return;
    const materia = e.materia || "Sem matéria", topico = e.topico || "Sem tópico";
    const k = materia + "\u0000" + topico;
    if (!t[k]) t[k] = { ...bloco(), materia, topico };
    t[k][prio(e)]++; t[k].total++;
  });
  return Object.values(t);
}
export function origemStats(items: Erro[]) {
  const o = {} as Record<OrigemKey, { total: number; abertos: number }>;
  (["desconhecimento", "confusao", "esquecimento", "interpretacao", "nc"] as OrigemKey[]).forEach((k) => (o[k] = { total: 0, abertos: 0 }));
  items.forEach((e) => {
    const k = origOf(e);
    o[k].total++;
    if (prio(e) !== "superado") o[k].abertos++;
  });
  return o;
}

export function filtrar(items: Erro[], f: Filtros): Erro[] {
  const q = norm(f.q);
  return items.filter(
    (e) =>
      (!f.materia || (e.materia || "Sem matéria") === f.materia) &&
      (!f.topico || (e.topico || "Sem tópico") === f.topico) &&
      (!f.prioridade || prio(e) === f.prioridade) &&
      (!f.origem || origOf(e) === f.origem) &&
      (!f.de || (e.dataRegistro || "") >= f.de) &&
      (!f.ate || (e.dataRegistro || "") <= f.ate) &&
      (!q || norm([e.descricao, e.correcao, e.comoEvitar, e.topico, e.materia, e.referencia].join(" ")).includes(q))
  );
}

/* ---------- backup ---------- */
export function montarBackup(items: Erro[], cat: Catalogo) {
  const materias: Catalogo = {};
  allMaterias(items, cat).forEach((m) => (materias[m] = topicsFor(items, cat, m)));
  return {
    app: "caderno-de-erros",
    dona: "Ana Karolina",
    versao: 2,
    exportadoEm: new Date().toISOString(),
    materias,
    erros: items.map((e) => ({ ...e, origem: e.origem || "" }))
  };
}

export interface ResultadoImport { erros: Erro[]; materias: Array<[string, string[]]>; invalidos: number; duplicados: number }

/** Valida e normaliza um backup. Não altera nada: quem chama decide o que gravar. */
export function lerBackup(texto: string, existentes: Erro[], cat: Catalogo): ResultadoImport {
  let j: unknown;
  try {
    j = JSON.parse(texto);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  const obj = j as { erros?: unknown; materias?: unknown };
  const lista = Array.isArray(j) ? j : obj && Array.isArray(obj.erros) ? obj.erros : null;
  if (!lista) throw new Error("O arquivo não tem a lista de erros de um backup do Caderno de Erros.");

  const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 5000) : "");
  const ids = new Set(existentes.map((e) => e.id));
  let workCat: Catalogo = { ...cat };
  const materias: Array<[string, string[]]> = [];
  if (obj && obj.materias && typeof obj.materias === "object" && !Array.isArray(obj.materias)) {
    Object.entries(obj.materias as Record<string, unknown>).forEach(([m, ts]) => {
      if (!m.trim()) return;
      const cm = canonMateria(existentes, workCat, m);
      const tops = (Array.isArray(ts) ? ts : []).filter((t): t is string => typeof t === "string" && !!t.trim()).map((t) => canonTopico(existentes, workCat, cm, t));
      materias.push([cm, tops]);
      workCat = catWith(workCat, cm) || workCat;
      tops.forEach((t) => (workCat = catWith(workCat, cm, t) || workCat));
    });
  }

  const erros: Erro[] = [];
  let invalidos = 0, duplicados = 0;
  for (const raw of lista as Array<Record<string, unknown>>) {
    if (!raw || typeof raw !== "object") { invalidos++; continue; }
    const materiaRaw = str(raw.materia), topicoRaw = str(raw.topico || raw.assunto), desc = str(raw.descricao || raw.questao);
    if (!materiaRaw || !topicoRaw || !desc) { invalidos++; continue; }
    const cleanId = String(raw.id ?? "").replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 80);
    if (cleanId && ids.has(cleanId)) { duplicados++; continue; }
    const materia = canonMateria(existentes, workCat, materiaRaw);
    const topico = canonTopico(existentes, workCat, materia, topicoRaw);
    workCat = catWith(workCat, materia, topico) || workCat;
    const prioridade = typeof raw.prioridade === "string" && raw.prioridade in PRIO ? (raw.prioridade as Prioridade) : "alta";
    const origem = typeof raw.origem === "string" && raw.origem in ORIG ? (raw.origem as Erro["origem"]) : "";
    const dataRegistro = isIsoDate(raw.dataRegistro) ? raw.dataRegistro : today();
    const e: Erro = {
      id: cleanId || uid(),
      materia, topico, descricao: desc,
      correcao: str(raw.correcao), comoEvitar: str(raw.comoEvitar), referencia: str(raw.referencia),
      origem, prioridade, dataRegistro,
      criadoEm: str(raw.criadoEm) || new Date().toISOString(),
      revisoes: typeof raw.revisoes === "number" && Number.isFinite(raw.revisoes) ? raw.revisoes : 0,
      historico: Array.isArray(raw.historico)
        ? (raw.historico as HistItem[]).filter((h) => h && typeof h === "object" && isIsoDate(h.d)).slice(-60)
        : []
    };
    if (isIsoDate(raw.superadoEm)) e.superadoEm = raw.superadoEm;
    else if (prioridade === "superado") e.superadoEm = dataRegistro;
    if (isIsoDate(raw.ultimaRevisao)) e.ultimaRevisao = raw.ultimaRevisao;
    ids.add(e.id);
    erros.push(e);
  }
  return { erros, materias, invalidos, duplicados };
}

/** Remove campos undefined (o Firestore não aceita). */
export const corpo = (e: Erro) => {
  const { id, ...rest } = clone(e);
  return rest;
};
