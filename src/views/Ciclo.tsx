import { Icon } from "../components/Icon";
import { EmptyState, OrigemChip, PrioLegend, StackBars } from "../components/ui";
import { PRIO } from "../constants";
import { byMateria, counts, prio, topTopicos, type Bloco } from "../lib/caderno";
import { useApp } from "../lib/context";
import { fmtShort, plural } from "../lib/utils";
import type { Erro, Prioridade } from "../types";

export function Ciclo() {
  const { items, abrir, irParaTopico } = useApp();
  if (!items.length) return <EmptyState title="Seu caderno está em branco" text="Os erros ainda não superados aparecem aqui para o seu segundo ciclo de revisão." />;

  const abertos = items.filter((e) => prio(e) !== "superado");
  const c = counts(items);
  if (!abertos.length)
    return <EmptyState icon="trophy" title="Todos os erros foram superados" text="Você não tem nenhum erro em prioridade alta ou média. Continue resolvendo questões e registre novos erros quando aparecerem." />;

  const ordem = (a: Erro, b: Erro) => (a.ultimaRevisao || "0").localeCompare(b.ultimaRevisao || "0") || (a.dataRegistro || "").localeCompare(b.dataRegistro || "");
  const alta = abertos.filter((e) => prio(e) === "alta").sort(ordem);
  const media = abertos.filter((e) => prio(e) === "media").sort(ordem);
  const fila = [...alta, ...media].map((e) => e.id);

  const peso = (v: Bloco) => v.alta * 2 + v.media;
  const bm = Object.entries(byMateria(items)).filter(([, v]) => v.alta + v.media > 0).sort((a, b) => peso(b[1]) - peso(a[1])).slice(0, 6) as Array<[string, Bloco]>;
  const tt = topTopicos(items, true).sort((a, b) => peso(b) - peso(a)).slice(0, 6);

  const coluna = (p: Prioridade, lista: Erro[]) => (
    <div className="card cyc-col">
      <h2><span className="d" style={{ background: PRIO[p].cor }} />{PRIO[p].nome} <span className="num" style={{ color: "var(--muted)", fontSize: 15 }}>{lista.length}</span></h2>
      <div className="sub">{PRIO[p].desc}</div>
      <div style={{ marginTop: 8 }}>
        {lista.length ? lista.map((e) => (
          <div className="cyc-item" key={e.id}>
            <div className="tx">
              <div className="p">{e.materia} › {e.topico}</div>
              <b>{e.descricao}</b>
              <div className="m"><OrigemChip e={e} /><span>{e.ultimaRevisao ? `revisado em ${fmtShort(e.ultimaRevisao)}` : "ainda não revisado"}</span></div>
            </div>
            <button className="btn btn-violet btn-sm" onClick={() => abrir({ kind: "review", queue: [e.id], idx: 0 })}><Icon name="eye" size={16} />REVISAR ERRO</button>
          </div>
        )) : <p className="sub" style={{ padding: "12px 0" }}>Nenhum erro nesta classificação.</p>}
      </div>
    </div>
  );

  return (
    <>
      <div className="card cyc-hd">
        <div>
          <h2 style={{ fontSize: 22 }}>Meu segundo ciclo</h2>
          <div className="sub">{plural(abertos.length, "erro ainda não superado", "erros ainda não superados")}: {c.alta} em alta e {c.media} em média. Revise primeiro os de prioridade alta.</div>
        </div>
        <button className="btn btn-primary" onClick={() => abrir({ kind: "review", queue: fila, idx: 0 })}><Icon name="repeat" />Revisar em sequência</button>
      </div>
      <div className="grid gap-4 cols-2e gap">{coluna("alta", alta)}{coluna("media", media)}</div>
      <div className="grid gap-4 cols-2e gap">
        <div className="card">
          <h2>Matérias com mais dificuldades</h2>
          <div className="sub">Erros em aberto, com peso maior para prioridade alta</div>
          <StackBars entries={bm} keys={["alta", "media"]} />
          <PrioLegend keys={["alta", "media"]} />
        </div>
        <div className="card">
          <h2>Tópicos que precisam de mais atenção</h2>
          <div className="sub">Toque para ver os erros do tópico</div>
          <div className="rows">
            {tt.map((t, i) => (
              <button key={t.materia + t.topico} className="row" type="button" onClick={() => irParaTopico(t.materia, t.topico)}>
                <span className="rank" style={t.alta ? { background: "var(--alta-soft)", color: "var(--alta)" } : undefined}>{i + 1}</span>
                <div className="tx"><b>{t.topico}</b><span>{t.materia}</span></div>
                <span className="cnt">
                  {t.alta > 0 && <span style={{ color: "var(--alta)" }}>{t.alta} alta</span>}
                  {t.alta > 0 && t.media > 0 && " · "}
                  {t.media > 0 && <span style={{ color: "var(--media)" }}>{t.media} média</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
