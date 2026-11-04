import { useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/ui";
import { EDITAL_NOME, EDITAL_TJSP, PRIO, PRIO_KEYS } from "../constants";
import { allMaterias, byMateria, mesclarCatalogo, topicsFor, type Bloco } from "../lib/caderno";
import { useApp } from "../lib/context";
import { clone, findName, pct, plural } from "../lib/utils";
import type { Catalogo } from "../types";

type Edicao = { kind: "m"; m: string } | { kind: "t"; m: string; t: string } | null;

function RenomearInline({ inicial, onSalvar, onCancelar }: { inicial: string; onSalvar: (v: string) => void; onCancelar: () => void }) {
  const [v, setV] = useState(inicial);
  return (
    <form className="inline-edit" onSubmit={(e) => { e.preventDefault(); onSalvar(v); }}>
      <input className="in" autoFocus value={v} onChange={(e) => setV(e.target.value)} aria-label="Novo nome"
        onKeyDown={(e) => { if (e.key === "Escape") onCancelar(); }} />
      <button className="ibtn" type="submit" aria-label="Salvar nome"><Icon name="check" size={14} /></button>
      <button className="ibtn" type="button" aria-label="Cancelar" onClick={onCancelar}><Icon name="x" size={14} /></button>
    </form>
  );
}

function NovoTopico({ materia }: { materia: string }) {
  const { items, cat, garantirNoCatalogo, notify } = useApp();
  const [v, setV] = useState("");
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const nome = v.trim();
    if (!nome) { notify("Digite o nome do tópico antes de adicionar.", "erro"); return; }
    const existe = findName(topicsFor(items, cat, materia), nome);
    if (existe) { notify(`"${existe}" já existe em ${materia}.`, "info"); return; }
    garantirNoCatalogo(materia, nome);
    setV("");
    notify("Tópico adicionado.");
  };
  return (
    <form className="addt" onSubmit={enviar}>
      <input className="in" placeholder="Novo tópico" value={v} onChange={(e) => setV(e.target.value)} aria-label={`Novo tópico em ${materia}`} />
      <button className="btn btn-ghost btn-sm" type="submit"><Icon name="plus" size={16} />Adicionar</button>
    </form>
  );
}

export function Materias() {
  const { items, cat, salvarCatalogo, garantirNoCatalogo, salvarVarios, abrir, notify, irParaTopico } = useApp();
  const [nova, setNova] = useState("");
  const [ed, setEd] = useState<Edicao>(null);
  const mats = allMaterias(items, cat);
  const bm = byMateria(items);
  const edital = mesclarCatalogo(items, cat, EDITAL_TJSP);

  const addEdital = () => {
    if (!edital.mudou) { notify("Todos os temas do edital já estão no caderno.", "info"); return; }
    salvarCatalogo(edital.next);
    const partes = [edital.materias && plural(edital.materias, "matéria", "matérias"), edital.topicos && plural(edital.topicos, "tópico", "tópicos")].filter(Boolean);
    notify(`Edital adicionado: ${partes.join(" e ")}.`);
  };

  const addMateria = (e: FormEvent) => {
    e.preventDefault();
    const nome = nova.trim();
    if (!nome) { notify("Digite o nome da matéria antes de adicionar.", "erro"); return; }
    const existe = findName(mats, nome);
    if (existe) { notify(`"${existe}" já está cadastrada.`, "info"); return; }
    garantirNoCatalogo(nome);
    setNova("");
    notify("Matéria adicionada.");
  };

  const renomearMateria = (antigo: string, novo: string) => {
    novo = novo.trim();
    if (!novo) { notify("O nome não pode ficar vazio.", "erro"); return; }
    if (novo === antigo) { setEd(null); return; }
    const conflito = findName(mats.filter((m) => m !== antigo), novo);
    if (conflito) { notify(`Já existe a matéria "${conflito}".`, "erro"); return; }
    const next: Catalogo = { ...cat };
    const k = findName(Object.keys(next), antigo);
    const tops = k ? next[k] : topicsFor(items, cat, antigo);
    if (k) delete next[k];
    next[novo] = [...tops];
    salvarCatalogo(next);
    salvarVarios(items.filter((e) => e.materia === antigo).map((e) => ({ ...clone(e), materia: novo })));
    setEd(null);
    notify("Matéria renomeada em todos os erros.");
  };

  const renomearTopico = (m: string, antigo: string, novo: string) => {
    novo = novo.trim();
    if (!novo) { notify("O nome não pode ficar vazio.", "erro"); return; }
    if (novo === antigo) { setEd(null); return; }
    const conflito = findName(topicsFor(items, cat, m).filter((t) => t !== antigo), novo);
    if (conflito) { notify(`Já existe o tópico "${conflito}" nesta matéria.`, "erro"); return; }
    const next: Catalogo = { ...cat };
    const k = findName(Object.keys(next), m) || m;
    next[k] = [...(next[k] || []).filter((t) => t !== antigo), novo];
    salvarCatalogo(next);
    salvarVarios(items.filter((e) => e.materia === m && e.topico === antigo).map((e) => ({ ...clone(e), topico: novo })));
    setEd(null);
    notify("Tópico renomeado em todos os erros.");
  };

  const excluirMateria = (m: string) =>
    abrir({
      kind: "confirm", title: "Excluir esta matéria?", okLabel: "Excluir",
      body: <p style={{ margin: 0 }}>A matéria <b style={{ color: "var(--ink)" }}>{m}</b> e os tópicos dela, que não têm erros registrados, serão removidos da lista.</p>,
      onOk: () => {
        const next = { ...cat };
        const k = findName(Object.keys(next), m);
        if (k) delete next[k];
        salvarCatalogo(next);
        notify("Matéria excluída.");
      }
    });

  const excluirTopico = (m: string, t: string) =>
    abrir({
      kind: "confirm", title: "Excluir este tópico?", okLabel: "Excluir",
      body: <p style={{ margin: 0 }}>O tópico <b style={{ color: "var(--ink)" }}>{t}</b> será removido de {m}. Ele não tem erros registrados.</p>,
      onOk: () => {
        const next = { ...cat };
        const k = findName(Object.keys(next), m);
        if (k) next[k] = next[k].filter((x) => x !== t);
        salvarCatalogo(next);
        notify("Tópico excluído.");
      }
    });

  return (
    <>
      <div className="card">
        <h2>Matérias e tópicos</h2>
        <div className="sub">Organize o edital. Nomes repetidos com acentos ou maiúsculas diferentes são reconhecidos e não duplicam. Renomear atualiza todos os erros ligados.</div>
        <form className="add-row gap" onSubmit={addMateria}>
          <input className="in" placeholder="Nova matéria (ex.: Direito Civil)" value={nova} onChange={(e) => setNova(e.target.value)} aria-label="Nova matéria" />
          <button className="btn btn-primary" type="submit"><Icon name="plus" />Adicionar matéria</button>
        </form>
        <div className="add-row gap" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="sub" style={{ flex: "1 1 260px", margin: 0 }}>
            <b style={{ color: "var(--ink)" }}>Edital {EDITAL_NOME}</b>
            {" · "}
            {edital.mudou
              ? `faltam ${[edital.materias && plural(edital.materias, "matéria", "matérias"), edital.topicos && plural(edital.topicos, "tópico", "tópicos")].filter(Boolean).join(" e ")} no caderno.`
              : "todos os temas já estão no caderno."}
          </div>
          <button className="btn btn-ghost" type="button" disabled={!edital.mudou} onClick={addEdital}><Icon name="layers" />Adicionar temas do edital</button>
        </div>
      </div>

      {mats.length === 0 ? (
        <div className="gap"><EmptyState icon="layers" title="Nenhuma matéria cadastrada" text="Adicione as matérias do seu edital aqui ou direto no formulário de registro de erro." /></div>
      ) : (
        <div className="mat-grid gap">
          {mats.map((m) => {
            const v = bm[m] || { total: 0, alta: 0, media: 0, superado: 0, topicos: {} as Record<string, Bloco> };
            const tops = topicsFor(items, cat, m);
            return (
              <div className="card mat-card" key={m}>
                <div className="hd">
                  {ed?.kind === "m" && ed.m === m ? (
                    <RenomearInline inicial={m} onSalvar={(nv) => renomearMateria(m, nv)} onCancelar={() => setEd(null)} />
                  ) : (
                    <>
                      <div className="tt">
                        <h3>{m}</h3>
                        <div className="sub">{plural(v.total, "erro", "erros")} · {plural(tops.length, "tópico", "tópicos")}{v.total ? ` · ${pct(v.superado, v.total)}% superados` : ""}</div>
                      </div>
                      <button className="ibtn" aria-label="Renomear matéria" onClick={() => setEd({ kind: "m", m })}><Icon name="edit" size={16} /></button>
                      <button className="ibtn danger" aria-label="Excluir matéria" disabled={v.total > 0} title={v.total ? "Só é possível excluir matérias sem erros registrados" : undefined} onClick={() => excluirMateria(m)}><Icon name="trash" size={16} /></button>
                    </>
                  )}
                </div>
                {v.total > 0 && (
                  <div className="chips" style={{ marginTop: 10 }}>
                    {PRIO_KEYS.filter((p) => v[p]).map((p) => (
                      <span key={p} className="chip" style={{ background: PRIO[p].soft, color: PRIO[p].cor }}><span className="d" />{v[p]} {PRIO[p].curto.toLowerCase()}</span>
                    ))}
                  </div>
                )}
                <div className="tops">
                  {tops.length === 0 && <p className="sub" style={{ margin: "8px 0 0" }}>Nenhum tópico ainda.</p>}
                  {tops.map((t) => {
                    const n = v.topicos[t]?.total || 0;
                    return (
                      <div className="tp" key={t}>
                        {ed?.kind === "t" && ed.m === m && ed.t === t ? (
                          <RenomearInline inicial={t} onSalvar={(nv) => renomearTopico(m, t, nv)} onCancelar={() => setEd(null)} />
                        ) : (
                          <>
                            <span className="nm">{n ? <button className="linkbtn" style={{ padding: 0, textAlign: "left" }} onClick={() => irParaTopico(m, t)}>{t}</button> : t}</span>
                            <span className="c">{plural(n, "erro", "erros")}</span>
                            <button className="ibtn" aria-label="Renomear tópico" onClick={() => setEd({ kind: "t", m, t })}><Icon name="edit" size={14} /></button>
                            <button className="ibtn danger" aria-label="Excluir tópico" disabled={n > 0} title={n ? "Só é possível excluir tópicos sem erros registrados" : undefined} onClick={() => excluirTopico(m, t)}><Icon name="trash" size={14} /></button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <NovoTopico materia={m} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
