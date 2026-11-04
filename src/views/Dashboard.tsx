import { Icon } from "../components/Icon";
import { Donut, EmptyState, Kpi, PrioLegend, Ring, StackBars } from "../components/ui";
import { DONA, PRIO, PRIO_KEYS } from "../constants";
import { byMateria, counts, prio, topTopicos } from "../lib/caderno";
import { useApp } from "../lib/context";
import { diffDays, fmtShort, pct, plural, today } from "../lib/utils";

export function Hero() {
  const { frase, novaFrase, nome } = useApp();
  return (
    <section className="hero">
      <figure className="hero-img">
        <img src="/avatar.webp" alt={`Ilustração da ${DONA} estudando, com cadernos abertos e uma coruja lendo ao lado`} width={640} height={640} />
      </figure>
      <div className="motiv" aria-label="Mensagem do dia">
        <div className="hi">Olá, {nome}!</div>
        <div className="lb"><Icon name="spark" size={16} />Mensagem para você</div>
        <blockquote>{frase}</blockquote>
        <button className="again" type="button" onClick={novaFrase}><Icon name="repeat" size={14} />Outra mensagem</button>
      </div>
    </section>
  );
}

export function Dashboard() {
  const { items, abrir, go, irParaTopico } = useApp();
  if (!items.length)
    return (
      <>
        <Hero />
        <div className="gap">
          <EmptyState title="Seu caderno está em branco"
            text="Registre a matéria, o tópico, o que você errou, a correção e a origem do erro. O dashboard, o segundo ciclo e a sua evolução aparecem a partir do primeiro registro."
            action={<button className="btn btn-primary" onClick={() => abrir({ kind: "form" })}><Icon name="plus" />Registrar novo erro</button>} />
        </div>
      </>
    );

  const c = counts(items);
  const t = today();
  const semana = items.filter((e) => e.dataRegistro && diffDays(t, e.dataRegistro) < 7).length;
  const sup30 = items.filter((e) => prio(e) === "superado" && e.superadoEm && diffDays(t, e.superadoEm) < 30).length;
  const nTopicos = new Set(items.map((e) => `${e.materia}|${e.topico}`)).size;
  const bm = Object.entries(byMateria(items)).sort((a, b) => b[1].total - a[1].total).slice(0, 8);
  const ultimos = [...items].sort((a, b) => (b.dataRegistro || "").localeCompare(a.dataRegistro || "") || (b.criadoEm || "").localeCompare(a.criadoEm || "")).slice(0, 5);
  const tt = topTopicos(items, false).sort((a, b) => b.total - a.total || b.alta - a.alta).slice(0, 5);
  const msgEvol = c.pct >= 50 ? "Mais da metade das suas dificuldades registradas já foi superada."
    : c.superado ? "Cada erro superado mostra que o método está funcionando."
    : "Revise seus erros no segundo ciclo e marque como superados os que você já domina.";

  return (
    <>
      <Hero />
      <div className="grid gap-4 kpis gap">
        <Kpi label="Total de erros" icon="book" bg="var(--blue-soft)" fg="var(--blue)" value={c.total} hint={`${plural(semana, "novo", "novos")} nesta semana`} />
        <Kpi label="Matérias" icon="layers" bg="var(--violet-soft)" fg="var(--violet)" value={c.materias} hint={plural(nTopicos, "tópico", "tópicos")} />
        <Kpi label="Prioridade alta" icon="alert" bg="var(--alta-soft)" fg="var(--alta)" value={c.alta} hint="pedem atenção agora" />
        <Kpi label="Prioridade média" icon="flag" bg="var(--media-soft)" fg="var(--media)" value={c.media} hint="compreendidos, em observação" />
        <Kpi label="Superados" icon="trophy" bg="var(--sup-soft)" fg="var(--sup)" value={c.superado} hint={`${plural(sup30, "superado", "superados")} nos últimos 30 dias`} />
        <Kpi label="Superados / total" icon="target" bg="var(--sup-soft)" fg="var(--sup)" value={<>{c.pct}<small>%</small></>} hint={`${c.superado} de ${c.total}`}>
          <div className="bar-mini"><i style={{ width: `${c.pct}%` }} /></div>
        </Kpi>
      </div>

      <div className="grid gap-4 cols-2 gap">
        <div className="card">
          <h2>Erros por matéria</h2>
          <div className="sub">Cada barra separada pelas três classificações</div>
          <StackBars entries={bm} />
          <PrioLegend />
        </div>
        <div className="card">
          <h2>Distribuição das classificações</h2>
          <div className="sub">Alta, média e superado</div>
          <div className="donut-wrap">
            <Donut parts={PRIO_KEYS.map((p) => ({ t: PRIO[p].nome, c: PRIO[p].cor, n: c[p] }))} center={c.total} legenda="registros" label="Distribuição das classificações" />
            <div className="donut-list">
              {PRIO_KEYS.map((p) => (
                <div key={p}><i style={{ background: PRIO[p].cor }} />{PRIO[p].nome}<b>{c[p]}</b><span className="c">{pct(c[p], c.total)}%</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 cols-3 gap">
        <div className="card">
          <h2>Últimos erros</h2>
          <div className="sub">Registrados mais recentemente</div>
          <div className="rows">
            {ultimos.map((e) => (
              <button key={e.id} className="row" type="button" onClick={() => abrir({ kind: "detail", id: e.id })}>
                <span className="chip" style={{ background: PRIO[prio(e)].soft, color: PRIO[prio(e)].cor, padding: "4px 8px" }}><span className="d" /></span>
                <div className="tx"><b>{e.descricao || e.topico}</b><span>{e.materia} · {e.topico} · {fmtShort(e.dataRegistro)}</span></div>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Assuntos com mais erros</h2>
          <div className="sub">Toque para ver os erros do tópico</div>
          <div className="rows">
            {tt.map((x, i) => (
              <button key={x.materia + x.topico} className="row" type="button" onClick={() => irParaTopico(x.materia, x.topico)}>
                <span className="rank">{i + 1}</span>
                <div className="tx"><b>{x.topico}</b><span>{x.materia}{x.alta ? ` · ${x.alta} em alta` : ""}</span></div>
                <span className="cnt">{plural(x.total, "erro", "erros")}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Sua evolução</h2>
          <div className="sub">Percentual de erros superados</div>
          <div className="ring-wrap">
            <Ring pct={c.pct} />
            <div className="tx">
              <p><b>{c.superado}</b> de <b>{c.total}</b> erros registrados já foram superados.</p>
              {sup30 > 0 && <p><span className="up"><Icon name="trend" size={14} />+{sup30} nos últimos 30 dias</span></p>}
              <p className="sub">{msgEvol}</p>
              <button className="linkbtn" onClick={() => go("evolucao")}>Ver minha evolução →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
