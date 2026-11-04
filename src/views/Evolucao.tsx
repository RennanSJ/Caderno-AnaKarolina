import { Icon } from "../components/Icon";
import { Donut, EmptyState, Kpi } from "../components/ui";
import { ORIG, ORIG_KEYS, origemInfo } from "../constants";
import { byMateria, counts, origemStats, prio } from "../lib/caderno";
import { useApp } from "../lib/context";
import { addDays, diffDays, fmtShort, pct, plural, today } from "../lib/utils";
import type { OrigemKey } from "../types";

function GraficoEvolucao({ pts }: { pts: Array<{ fim: string; reg: number; sup: number }> }) {
  const W = pts.length;
  const maxV = Math.max(4, ...pts.map((p) => p.reg));
  const step = Math.ceil(maxV / 4), topo = step * 4;
  const cw = 640, ch = 240, pl = 34, pr = 12, pb = 28, ptp = 12;
  const x = (i: number) => pl + (cw - pl - pr) * (W === 1 ? 0.5 : i / (W - 1));
  const y = (v: number) => ptp + (ch - ptp - pb) * (1 - v / topo);
  const line = (k: "reg" | "sup") => pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const area = (k: "reg" | "sup") => `${line(k)} L${x(W - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const cada = Math.ceil(W / 8);
  const ult = pts[W - 1];
  return (
    <svg className="chart-svg" viewBox={`0 0 ${cw} ${ch}`} role="img" aria-label="Erros registrados e superados acumulados por semana">
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={pl} x2={cw - pr} y1={y(k * step)} y2={y(k * step)} stroke="var(--line)" />
          <text x={pl - 8} y={y(k * step) + 4} textAnchor="end">{k * step}</text>
        </g>
      ))}
      {pts.map((p, i) => (i % cada === 0 || i === W - 1 ? <text key={p.fim} x={x(i)} y={ch - 8} textAnchor="middle">{fmtShort(p.fim)}</text> : null))}
      <path d={area("reg")} fill="var(--blue)" opacity={0.08} />
      <path d={area("sup")} fill="var(--sup)" opacity={0.16} />
      <path d={line("reg")} fill="none" stroke="var(--blue)" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={line("sup")} fill="none" stroke="var(--sup)" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={x(W - 1)} cy={y(ult.reg)} r={5} fill="var(--blue)" stroke="var(--surface)" strokeWidth={2} />
      <circle cx={x(W - 1)} cy={y(ult.sup)} r={5} fill="var(--sup)" stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}

export function Evolucao() {
  const { items, go } = useApp();
  if (!items.length) return <EmptyState icon="trend" title="Ainda não há evolução para mostrar" text="Registre seus erros e revise-os no segundo ciclo. A sua evolução aparece aqui." />;

  const c = counts(items);
  const t = today();
  const primeiro = items.map((e) => e.dataRegistro).filter(Boolean).sort()[0] || t;
  const W = Math.min(Math.max(Math.ceil((diffDays(t, primeiro) + 1) / 7), 4), 16);
  const pts = Array.from({ length: W }, (_, j) => {
    const fim = addDays(t, -7 * (W - 1 - j));
    return {
      fim,
      reg: items.filter((e) => (e.dataRegistro || "") <= fim).length,
      sup: items.filter((e) => prio(e) === "superado" && (e.superadoEm || e.dataRegistro || "") <= fim).length
    };
  });
  const ult = pts[W - 1], antes = pts[Math.max(0, W - 5)];
  const pAntes = pct(antes.sup, antes.reg), delta = c.pct - pAntes;

  const porMateria = Object.entries(byMateria(items)).sort((a, b) => pct(b[1].superado, b[1].total) - pct(a[1].superado, a[1].total) || b[1].total - a[1].total);

  const os = origemStats(items);
  const chaves: OrigemKey[] = [...ORIG_KEYS, "nc"];
  const classificados = ORIG_KEYS.reduce((a, k) => a + os[k].total, 0);
  const topO = ORIG_KEYS.filter((k) => os[k].total).sort((a, b) => os[b].total - os[a].total)[0];
  const maxO = Math.max(1, ...chaves.map((k) => os[k].total));

  return (
    <>
      <p className="disclaimer"><Icon name="info" size={16} style={{ marginTop: 2, color: "var(--blue)" }} />
        Aqui você acompanha a superação das dificuldades anotadas no caderno. Os números se referem a erros registrados, não ao total de erros cometidos em provas ou simulados.</p>

      <div className="grid gap-4 kpis">
        <Kpi label="Registrados" icon="book" bg="var(--blue-soft)" fg="var(--blue)" value={c.total} hint="no caderno desde o início" />
        <Kpi label="Superados" icon="trophy" bg="var(--sup-soft)" fg="var(--sup)" value={c.superado} hint="dificuldades vencidas" />
        <Kpi label="Em alta" icon="alert" bg="var(--alta-soft)" fg="var(--alta)" value={c.alta} hint={`${pct(c.alta, c.total)}% do total`} />
        <Kpi label="Em média" icon="flag" bg="var(--media-soft)" fg="var(--media)" value={c.media} hint={`${pct(c.media, c.total)}% do total`} />
        <Kpi label="Evolução" icon="target" bg="var(--sup-soft)" fg="var(--sup)" value={<>{c.pct}<small>%</small></>} hint="dos erros já superados" />
        <Kpi label="Últimas 4 semanas" icon="trend" bg={delta >= 0 ? "var(--sup-soft)" : "var(--alta-soft)"} fg={delta >= 0 ? "var(--sup)" : "var(--alta)"}
          value={<>{delta > 0 ? "+" : ""}{delta}<small> p.p.</small></>} hint={`era ${pAntes}% há 4 semanas`} />
      </div>

      <div className="card gap">
        <h2>Erros registrados x superados ao longo do tempo</h2>
        <div className="sub">Totais acumulados por semana. Quanto mais a linha verde se aproxima da azul, maior a sua evolução.</div>
        <GraficoEvolucao pts={pts} />
        <div className="legend">
          <span><i style={{ background: "var(--blue)" }} />Registrados (acumulado): {ult.reg}</span>
          <span><i style={{ background: "var(--sup)" }} />Superados (acumulado): {ult.sup}</span>
        </div>
      </div>

      <div className="grid gap-4 cols-2e gap">
        <div className="card">
          <h2>Evolução por matéria</h2>
          <div className="sub">Percentual de erros superados em cada matéria</div>
          <div className="hbars">
            {porMateria.map(([n, v]) => (
              <div key={n}>
                <div className="hbar">
                  <span className="nm" title={n}>{n}</span>
                  <span className="track"><i style={{ width: `${pct(v.superado, v.total)}%`, background: "var(--sup)" }} /></span>
                  <span className="n">{pct(v.superado, v.total)}%</span>
                </div>
                <div className="sub" style={{ fontSize: 12 }}>
                  {v.superado} de {v.total} superados{v.alta ? ` · ${v.alta} em alta` : ""}{v.media ? ` · ${v.media} em média` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Origem dos erros</h2>
          <div className="sub">Quantidade e porcentagem por causa</div>
          <div className="donut-wrap">
            <Donut parts={chaves.map((k) => ({ t: origemInfo(k).nome, c: origemInfo(k).cor, n: os[k].total }))} center={c.total} legenda="erros" label="Erros por origem" />
            <div className="tablewrap" style={{ flex: 1, minWidth: 0 }}>
              <table className="otable"><tbody>
                {chaves.filter((k) => k !== "nc" || os.nc.total).map((k) => {
                  const o = origemInfo(k);
                  return (
                    <tr key={k}>
                      <td><span className="chip" style={{ background: o.soft, color: o.cor }}><Icon name={o.icon} size={13} />{o.nome}</span></td>
                      <td style={{ width: "36%" }}><div className="bar"><i style={{ width: `${(os[k].total / maxO) * 100}%`, background: o.cor }} /></div></td>
                      <td className="n">{os[k].total}</td>
                      <td className="n" style={{ color: "var(--muted)" }}>{pct(os[k].total, c.total)}%</td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
          </div>
          {topO && (
            <div className="callout" style={{ background: ORIG[topO].soft }}>
              <div className="ico" style={{ color: ORIG[topO].cor }}><Icon name={ORIG[topO].icon} size={22} /></div>
              <p>
                <span className="sub" style={{ display: "block", margin: "0 0 2px" }}>Origem mais frequente</span>
                <strong style={{ color: ORIG[topO].cor }}>{ORIG[topO].nome} · {pct(os[topO].total, classificados)}% dos classificados</strong>
                {ORIG[topO].dica}
              </p>
            </div>
          )}
          {os.nc.total > 0 && (
            <p className="sub" style={{ marginTop: 10 }}>
              {plural(os.nc.total, "registro ainda está", "registros ainda estão")} como "Não classificado". Defina a origem em{" "}
              <button className="linkbtn" style={{ padding: 0 }} onClick={() => go("erros")}>Meus erros</button> para deixar esta análise mais precisa.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
