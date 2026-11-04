import { useState } from "react";
import { Icon } from "../components/Icon";
import { EmptyState, OrigemChip, PrioChip } from "../components/ui";
import { ORIG, ORIG_KEYS, PRIO, PRIO_KEYS, origemInfo } from "../constants";
import { byMateria, filtrar, logH, origOf, prio, setPrioridade } from "../lib/caderno";
import { useApp } from "../lib/context";
import { clone, fmt, plural, sortPt } from "../lib/utils";
import { FILTROS_VAZIOS, type Erro, type Filtros, type OrigemKey, type OrigemValida, type Prioridade } from "../types";

export function ErroCard({ e }: { e: Erro }) {
  const { salvar, remover, abrir, notify } = useApp();
  const p = prio(e), k = origOf(e), oi = origemInfo(k);
  const setP = (np: Prioridade) => {
    if (np === p) return;
    const n = clone(e);
    setPrioridade(n, np);
    delete n.exemplo;
    salvar(n);
    notify(`Classificado como ${PRIO[np].nome.toLowerCase()}.`);
  };
  const setO = (no: OrigemValida) => {
    const n = clone(e);
    logH(n, "origem", { de: n.origem || "", para: no });
    n.origem = no;
    delete n.exemplo;
    salvar(n);
    notify(`Origem alterada para ${ORIG[no].nome}.`);
  };
  return (
    <article className="err">
      <div className="path">{e.materia || "Sem matéria"} <span>›</span> {e.topico || "Sem tópico"}</div>
      <p className="ds">{e.descricao || "Sem descrição"}</p>
      <div className="chips">
        <PrioChip e={e} />
        <OrigemChip e={e} />
        {e.exemplo && <span className="chip ex">Exemplo</span>}
      </div>
      <div className="meta">
        <span><Icon name="cal" size={14} />{fmt(e.dataRegistro)}</span>
        {e.revisoes > 0 && <span><Icon name="repeat" size={14} />{plural(e.revisoes, "revisão", "revisões")}</span>}
        {e.referencia && <span><Icon name="link" size={14} />ref.</span>}
      </div>
      <div className="quick">
        <div className="seg3" role="group" aria-label="Alterar classificação">
          {PRIO_KEYS.map((x) => (
            <button key={x} type="button" className={x === p ? "on" : ""} aria-pressed={x === p} onClick={() => setP(x)}
              style={x === p ? { background: PRIO[x].cor } : undefined}>
              <span className="d" style={{ background: PRIO[x].cor }} />{PRIO[x].curto}
            </button>
          ))}
        </div>
        <select className="osel" aria-label="Alterar origem do erro" value={k} style={{ background: oi.soft, color: oi.cor }}
          onChange={(ev) => setO(ev.target.value as OrigemValida)}>
          {ORIG_KEYS.map((o) => <option key={o} value={o}>{ORIG[o].nome}</option>)}
          <option value="nc" disabled>Não classificado</option>
        </select>
      </div>
      <div className="err-foot">
        <button className="btn btn-ghost btn-sm" onClick={() => abrir({ kind: "detail", id: e.id })}><Icon name="eye" size={16} />Ver detalhes</button>
        <span className="grow" />
        <button className="ibtn" aria-label="Editar" onClick={() => abrir({ kind: "form", erro: e })}><Icon name="edit" size={16} /></button>
        <button className="ibtn danger" aria-label="Excluir" onClick={() => confirmarExclusao(e, abrir, () => { remover([e.id]); notify("Erro excluído."); })}><Icon name="trash" size={16} /></button>
      </div>
    </article>
  );
}

export function confirmarExclusao(e: Erro, abrir: ReturnType<typeof useApp>["abrir"], onOk: () => void) {
  abrir({
    kind: "confirm",
    title: "Excluir este erro?",
    okLabel: "Excluir",
    body: (
      <p style={{ margin: 0 }}>
        O registro de <b style={{ color: "var(--ink)" }}>{e.topico}</b> ({e.materia}) e o histórico dele serão apagados.
        Para guardar o histórico, marque como superado em vez de excluir.
      </p>
    ),
    onOk
  });
}

export function MeusErros() {
  const app = useApp();
  const { items, filtros: f, setFiltros, abrir } = app;
  const [treeOpen, setTreeOpen] = useState(() => window.innerWidth > 980);

  if (!items.length)
    return <EmptyState title="Seu caderno está em branco" text="Registre o primeiro erro para vê-lo aqui, organizado por matéria e tópico."
      action={<button className="btn btn-primary" onClick={() => abrir({ kind: "form" })}><Icon name="plus" />Registrar novo erro</button>} />;

  const bm = byMateria(items);
  const mats = Object.keys(bm).sort(sortPt);
  const topicos = f.materia && bm[f.materia] ? Object.keys(bm[f.materia].topicos).sort(sortPt) : [...new Set(items.map((e) => e.topico || "Sem tópico"))].sort(sortPt);
  const ativo = Boolean(f.q || f.materia || f.topico || f.prioridade || f.origem || f.de || f.ate);
  const r = filtrar(items, f);
  const temExemplo = items.some((e) => e.exemplo);
  const set = (patch: Partial<Filtros>) => setFiltros({ ...f, ...patch });

  const grupos: Record<string, Record<string, Erro[]>> = {};
  r.forEach((e) => {
    const m = e.materia || "Sem matéria", t = e.topico || "Sem tópico";
    (grupos[m] ||= {});
    (grupos[m][t] ||= []).push(e);
  });
  const po: Record<Prioridade, number> = { alta: 0, media: 1, superado: 2 };

  return (
    <div className="layout">
      <aside className="card tree">
        <details open={treeOpen} onToggle={(ev) => setTreeOpen((ev.target as HTMLDetailsElement).open)}>
          <summary>Matérias e tópicos <Icon name="chev" /></summary>
          <button className={`tnode mat ${!f.materia ? "on" : ""}`} onClick={() => set({ materia: "", topico: "" })}>
            <span className="nm">Todos os erros</span><span className="c">{items.length}</span>
          </button>
          {mats.map((m) => (
            <div key={m}>
              <button className={`tnode mat ${f.materia === m && !f.topico ? "on" : ""}`} onClick={() => set({ materia: m, topico: "" })}>
                <span className="nm">{m}</span><span className="c">{bm[m].total}</span>
              </button>
              {Object.keys(bm[m].topicos).sort(sortPt).map((t) => (
                <button key={t} className={`tnode top ${f.materia === m && f.topico === t ? "on" : ""}`} onClick={() => set({ materia: m, topico: t })}>
                  {bm[m].topicos[t].alta > 0 && <span className="al" title="Tem erros de prioridade alta" />}
                  <span className="nm">{t}</span><span className="c">{bm[m].topicos[t].total}</span>
                </button>
              ))}
            </div>
          ))}
        </details>
      </aside>

      <div style={{ minWidth: 0 }}>
        <label className="search">
          <Icon name="search" />
          <input type="search" placeholder="Buscar nas descrições, correções e macetes…" value={f.q} aria-label="Buscar erros" onChange={(ev) => set({ q: ev.target.value })} />
        </label>
        <div className="filters">
          <select className="sel" aria-label="Matéria" value={f.materia} onChange={(ev) => set({ materia: ev.target.value, topico: "" })}>
            <option value="">Todas as matérias</option>
            {mats.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="sel" aria-label="Tópico" value={f.topico} onChange={(ev) => set({ topico: ev.target.value })}>
            <option value="">Todos os tópicos</option>
            {topicos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="sel" aria-label="Classificação" value={f.prioridade} onChange={(ev) => set({ prioridade: ev.target.value as Filtros["prioridade"] })}>
            <option value="">Todas as classificações</option>
            {PRIO_KEYS.map((p) => <option key={p} value={p}>{PRIO[p].nome}</option>)}
          </select>
          <select className="sel" aria-label="Origem do erro" value={f.origem} onChange={(ev) => set({ origem: ev.target.value as "" | OrigemKey })}>
            <option value="">Todas as origens</option>
            {ORIG_KEYS.map((o) => <option key={o} value={o}>{ORIG[o].nome}</option>)}
            <option value="nc">Não classificado</option>
          </select>
          <div className="dates">
            <label htmlFor="fde">De</label>
            <input type="date" id="fde" value={f.de} onChange={(ev) => set({ de: ev.target.value })} />
            <label htmlFor="fate">até</label>
            <input type="date" id="fate" value={f.ate} onChange={(ev) => set({ ate: ev.target.value })} />
          </div>
        </div>
        <div className="count-line">
          <span>
            <b className="num" style={{ color: "var(--ink)" }}>{r.length}</b> de {plural(items.length, "erro", "erros")}
            {ativo && <> · <button className="linkbtn" onClick={() => setFiltros(FILTROS_VAZIOS)}>Limpar filtros</button></>}
          </span>
          <span className="flex gap-2 flex-wrap">
            {temExemplo && <button className="btn btn-ghost btn-sm" onClick={() => app.go("backup")}><Icon name="x" size={16} />Remover exemplos</button>}
            <button className="btn btn-ghost btn-sm" onClick={() => app.go("backup")}><Icon name="down" size={16} />Backup</button>
          </span>
        </div>

        {r.length === 0 ? (
          <EmptyState icon="search" title="Nenhum erro encontrado" text="Nenhum registro atende a todos os filtros ao mesmo tempo. Ajuste a busca ou limpe os filtros."
            action={<button className="btn btn-ghost" onClick={() => setFiltros(FILTROS_VAZIOS)}>Limpar filtros</button>} />
        ) : (
          Object.keys(grupos).sort(sortPt).map((m) => {
            const tps = grupos[m];
            const n = Object.values(tps).reduce((a, b) => a + b.length, 0);
            return (
              <section className="group" key={m}>
                <div className="group-hd"><h2>{m}</h2><span className="sub" style={{ margin: 0 }}>{plural(n, "erro", "erros")} · {plural(Object.keys(tps).length, "tópico", "tópicos")}</span></div>
                {Object.keys(tps).sort(sortPt).map((t) => (
                  <div key={t}>
                    <div className="topic-hd">
                      <button type="button" onClick={() => set({ materia: m, topico: t })}>{t}</button>
                      <span className="num" style={{ color: "var(--muted)", fontWeight: 600 }}>{tps[t].length}</span>
                    </div>
                    <div className="list">
                      {tps[t].sort((a, b) => po[prio(a)] - po[prio(b)] || (b.dataRegistro || "").localeCompare(a.dataRegistro || "")).map((e) => <ErroCard key={e.id} e={e} />)}
                    </div>
                  </div>
                ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
