import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { PRIO, PRIO_KEYS, origemInfo } from "../constants";
import { origOf, prio, type Bloco } from "../lib/caderno";
import type { Erro } from "../types";

export function PrioChip({ e, curto }: { e: Erro; curto?: boolean }) {
  const p = PRIO[prio(e)];
  return (
    <span className="chip" style={{ background: p.soft, color: p.cor }}>
      <span className="d" />
      {curto ? p.curto : p.nome}
    </span>
  );
}

export function OrigemChip({ e }: { e: Erro }) {
  const o = origemInfo(origOf(e));
  return (
    <span className="chip" style={{ background: o.soft, color: o.cor }}>
      <Icon name={o.icon} size={13} />
      {o.nome}
    </span>
  );
}

export function Kpi({ label, icon, bg, fg, value, hint, children }: { label: string; icon: IconName; bg: string; fg: string; value: ReactNode; hint: ReactNode; children?: ReactNode }) {
  return (
    <div className="card kpi">
      <div className="lbl">
        <span className="ico" style={{ background: bg, color: fg }}><Icon name={icon} size={16} /></span>
        {label}
      </div>
      <div className="val">{value}</div>
      {children}
      <div className="hint">{hint}</div>
    </div>
  );
}

export function EmptyState({ icon = "book", title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card empty">
      <div className="art"><Icon name={icon} size={30} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export interface Fatia { t: string; c: string; n: number }
export function Donut({ parts, center, legenda, label }: { parts: Fatia[]; center: ReactNode; legenda: string; label: string }) {
  const tot = parts.reduce((a, b) => a + b.n, 0) || 1;
  const R = 56, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 156 156" role="img" aria-label={label}>
      <circle r={R} cx={78} cy={78} fill="none" stroke="var(--bg)" strokeWidth={22} />
      {parts.filter((p) => p.n).map((p) => {
        const len = (p.n / tot) * C;
        const el = (
          <circle key={p.t} r={R} cx={78} cy={78} fill="none" stroke={p.c} strokeWidth={22}
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 78 78)">
            <title>{`${p.t}: ${p.n}`}</title>
          </circle>
        );
        acc += len;
        return el;
      })}
      <text x={78} y={78} textAnchor="middle" style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 30, fill: "var(--ink)" }}>{center}</text>
      <text x={78} y={98} textAnchor="middle" style={{ fontFamily: "var(--f-body)", fontSize: 11, fill: "var(--muted)" }}>{legenda}</text>
    </svg>
  );
}

export function Ring({ pct }: { pct: number }) {
  const R = 54, C = 2 * Math.PI * R, len = (C * pct) / 100;
  return (
    <svg viewBox="0 0 132 132" role="img" aria-label={`${pct}% superados`}>
      <circle r={R} cx={66} cy={66} fill="none" stroke="var(--bg)" strokeWidth={14} />
      <circle r={R} cx={66} cy={66} fill="none" stroke="var(--sup)" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${len} ${C}`} transform="rotate(-90 66 66)" />
      <text x={66} y={72} textAnchor="middle" style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 28, fill: "var(--ink)" }}>{pct}%</text>
    </svg>
  );
}

export function StackBars({ entries, keys = PRIO_KEYS }: { entries: Array<[string, Bloco]>; keys?: Array<"alta" | "media" | "superado"> }) {
  const max = Math.max(1, ...entries.map(([, v]) => keys.reduce((a, k) => a + v[k], 0)));
  return (
    <div className="hbars">
      {entries.map(([n, v]) => (
        <div className="hbar" key={n}>
          <span className="nm" title={n}>{n}</span>
          <span className="track">
            {keys.map((k) => <i key={k} style={{ width: `${(v[k] / max) * 100}%`, background: PRIO[k].cor }} title={`${PRIO[k].nome}: ${v[k]}`} />)}
          </span>
          <span className="n">{keys.reduce((a, k) => a + v[k], 0)}</span>
        </div>
      ))}
    </div>
  );
}

export function PrioLegend({ keys = PRIO_KEYS }: { keys?: Array<"alta" | "media" | "superado"> }) {
  return (
    <div className="legend">
      {keys.map((k) => <span key={k}><i style={{ background: PRIO[k].cor }} />{PRIO[k].nome}</span>)}
    </div>
  );
}
