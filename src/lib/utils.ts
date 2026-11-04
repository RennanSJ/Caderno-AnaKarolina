const pad = (n: number) => String(n).padStart(2, "0");

export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => isoDate(new Date());
export const parseDate = (s: string) => {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const addDays = (s: string, n: number) => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};
export const diffDays = (a: string, b: string) => Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
/** DD/MM/AAAA */
export const fmt = (s?: string) => {
  if (!s) return "—";
  const d = parseDate(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
/** DD/MM */
export const fmtShort = (s?: string) => {
  if (!s) return "—";
  const d = parseDate(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};
export const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const uid = () => "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
export const norm = (s: unknown) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
/** Ordem alfabética em português; números em ordem numérica (art. 9 antes de art. 10). */
export const sortPt = (a: string, b: string) => a.localeCompare(b, "pt", { numeric: true });
/** Encontra um nome já existente ignorando acentos e maiúsculas. */
export const findName = (list: string[], name: string) => {
  const n = norm(name);
  return list.find((x) => norm(x) === n);
};

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const v = JSON.parse(raw);
    return (v ?? fallback) as T;
  } catch {
    return fallback;
  }
}
export function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento cheio ou bloqueado */
  }
}
