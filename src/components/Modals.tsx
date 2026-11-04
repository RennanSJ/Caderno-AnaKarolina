import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { OrigemChip, PrioChip } from "./ui";
import { MATERIAS_SUGERIDAS, ORIG, ORIG_KEYS, PRIO, PRIO_KEYS, origemInfo } from "../constants";
import { allMaterias, canonMateria, canonTopico, logH, prio, setPrioridade, topicosComEdital } from "../lib/caderno";
import { useApp } from "../lib/context";
import { clone, findName, fmt, fmtShort, isUrl, plural, today, uid } from "../lib/utils";
import type { Erro, HistItem, OrigemValida, Prioridade } from "../types";

export function Overlay({ children, onClose, labelledBy, role = "dialog", className = "" }: { children: ReactNode; onClose: () => void; labelledBy: string; role?: string; className?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${className}`} role={role} aria-modal="true" aria-labelledby={labelledBy}>{children}</div>
    </div>
  );
}

function Fechar({ onClick }: { onClick: () => void }) {
  return <button type="button" className="ibtn" onClick={onClick} aria-label="Fechar"><Icon name="x" size={16} /></button>;
}

/* ---------- Formulário ---------- */
type OptInfo = { nome: string; desc: string; icon: Parameters<typeof Icon>[0]["name"]; cor: string; soft: string; ex?: string };
function Opcao({ name, value, info, checked, onChange }: { name: string; value: string; info: OptInfo; checked: boolean; onChange: () => void }) {
  const id = `${name}-${value}`;
  return (
    <div className="opt" style={{ "--c": info.cor, "--cs": info.soft } as CSSProperties}>
      <input type="radio" name={name} id={id} value={value} checked={checked} onChange={onChange} />
      <label htmlFor={id}>
        <span className="oi" style={{ background: info.soft, color: info.cor }}><Icon name={info.icon} size={17} /></span>
        <span className="ot"><b>{info.nome}</b><small>{info.desc}{info.ex ? ` ${info.ex}` : ""}</small></span>
      </label>
    </div>
  );
}

const NOVA = "__nova";

export function ErroForm({ erro }: { erro?: Erro }) {
  const { items, cat, salvar, fechar, notify, filtros } = useApp();
  const novo = !erro;
  const mats = useMemo(() => allMaterias(items, cat), [items, cat]);
  const sugestoes = MATERIAS_SUGERIDAS.filter((m) => !findName(mats, m));
  const inicialMat = erro?.materia || (filtros.materia && findName(mats, filtros.materia)) || "";

  const [materiaSel, setMateriaSel] = useState(inicialMat);
  const [materiaNova, setMateriaNova] = useState("");
  const [topico, setTopico] = useState(erro?.topico || (inicialMat && filtros.topico) || "");
  const [descricao, setDescricao] = useState(erro?.descricao || "");
  const [correcao, setCorrecao] = useState(erro?.correcao || "");
  const [comoEvitar, setComoEvitar] = useState(erro?.comoEvitar || "");
  const [origem, setOrigem] = useState<OrigemValida | "">(erro?.origem || "");
  const [prioridade, setPrio] = useState<Prioridade>(erro ? prio(erro) : "alta");
  const [referencia, setReferencia] = useState(erro?.referencia || "");
  const [dataRegistro, setData] = useState(erro?.dataRegistro || today());
  const [invalidos, setInvalidos] = useState<Set<string>>(new Set());
  const refs = { materia: useRef<HTMLDivElement>(null), topico: useRef<HTMLDivElement>(null), descricao: useRef<HTMLDivElement>(null), origem: useRef<HTMLDivElement>(null) };

  const materiaEfetiva = materiaSel === NOVA ? materiaNova.trim() : materiaSel;
  const topicosDaMateria = materiaEfetiva ? topicosComEdital(items, cat, materiaEfetiva) : [];

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    const faltando = new Set<string>();
    if (!materiaEfetiva) faltando.add("materia");
    if (!topico.trim()) faltando.add("topico");
    if (!descricao.trim()) faltando.add("descricao");
    if (!origem) faltando.add("origem");
    setInvalidos(faltando);
    if (faltando.size) {
      const primeiro = (["materia", "topico", "descricao", "origem"] as const).find((k) => faltando.has(k))!;
      refs[primeiro].current?.scrollIntoView({ behavior: "smooth", block: "center" });
      notify(primeiro === "origem" ? "Escolha a origem do erro para salvar." : "Preencha os campos obrigatórios marcados.", "erro");
      return;
    }
    const materia = canonMateria(items, cat, materiaEfetiva);
    if (materiaSel === NOVA && materia !== materiaEfetiva) notify(`"${materia}" já existe e foi usada, sem duplicar.`, "info");
    const top = canonTopico(items, cat, materia, topico);
    const n: Erro = erro ? clone(erro) : { id: uid(), criadoEm: new Date().toISOString(), revisoes: 0, historico: [] } as unknown as Erro;
    Object.assign(n, {
      materia, topico: top, descricao: descricao.trim(), correcao: correcao.trim(), comoEvitar: comoEvitar.trim(),
      referencia: referencia.trim(), dataRegistro: dataRegistro || today()
    });
    if (novo) {
      n.prioridade = prioridade;
      n.origem = origem as OrigemValida;
      if (prioridade === "superado") n.superadoEm = today();
      logH(n, "criado", { para: prioridade });
    } else {
      if ((erro!.origem || "") !== origem) { logH(n, "origem", { de: erro!.origem || "", para: origem }); n.origem = origem as OrigemValida; }
      setPrioridade(n, prioridade);
      logH(n, "editado");
      delete n.exemplo;
    }
    salvar(n);
    fechar();
    notify(novo ? "Erro salvo no caderno." : "Alterações salvas.");
  };

  const cls = (k: string, extra = "") => `f ${extra} ${invalidos.has(k) ? "invalid" : ""}`;

  return (
    <Overlay onClose={fechar} labelledBy="fTitle">
      <form onSubmit={enviar} noValidate>
        <div className="modal-hd"><h2 id="fTitle">{novo ? "Registrar novo erro" : "Editar erro"}</h2><Fechar onClick={fechar} /></div>
        <div className="modal-bd">
          <div className={cls("materia", "h")} ref={refs.materia}>
            <label htmlFor="f-materia">1. Matéria <em>*</em></label>
            <select className="in sel" id="f-materia" value={materiaSel} autoFocus={!inicialMat} onChange={(e) => { setMateriaSel(e.target.value); if (e.target.value !== erro?.materia) setTopico(""); }}>
              <option value="">Selecione…</option>
              {mats.length > 0 && <optgroup label="Minhas matérias">{mats.map((m) => <option key={m} value={m}>{m}</option>)}</optgroup>}
              {sugestoes.length > 0 && <optgroup label="Sugestões">{sugestoes.map((m) => <option key={m} value={m}>{m}</option>)}</optgroup>}
              <option value={NOVA}>+ Adicionar nova matéria</option>
            </select>
            {materiaSel === NOVA && <input className="in" autoFocus placeholder="Nome da nova matéria" value={materiaNova} onChange={(e) => setMateriaNova(e.target.value)} />}
          </div>
          <div className={cls("topico", "h")} ref={refs.topico}>
            <label htmlFor="f-topico">2. Tópico <em>*</em></label>
            <input className="in" id="f-topico" list="dl-topicos" autoComplete="off" autoFocus={!!inicialMat && novo} placeholder="Ex.: Direitos fundamentais" value={topico} onChange={(e) => setTopico(e.target.value)} />
            <datalist id="dl-topicos">{topicosDaMateria.map((t) => <option key={t} value={t} />)}</datalist>
            {topicosDaMateria.length > 0 && <span className="help">Escolha um tópico existente ou digite um novo.</span>}
          </div>
          <div className={cls("descricao")} ref={refs.descricao}>
            <label htmlFor="f-descricao">3. Descrição do erro <em>*</em></label>
            <textarea className="in" id="f-descricao" placeholder="O que você errou? Ex.: marquei que a revogação tem efeitos retroativos." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="f">
            <label htmlFor="f-correcao">4. Correção / entendimento correto</label>
            <textarea className="in" id="f-correcao" placeholder="Qual é o entendimento certo? Cite artigo, súmula ou regra." value={correcao} onChange={(e) => setCorrecao(e.target.value)} />
          </div>
          <div className="f">
            <label htmlFor="f-evitar">5. Como evitar esse erro novamente?</label>
            <textarea className="in" id="f-evitar" style={{ minHeight: 64 }} placeholder="Macete, alerta ou palavra-chave que vai te lembrar na prova." value={comoEvitar} onChange={(e) => setComoEvitar(e.target.value)} />
          </div>
          <div className={cls("origem")} ref={refs.origem}>
            <span className="lbl">Qual foi a origem do meu erro? <em>*</em></span>
            <div className="opt-grid c2" role="radiogroup" aria-label="Origem do erro">
              {ORIG_KEYS.map((k) => <Opcao key={k} name="orig" value={k} info={ORIG[k]} checked={origem === k} onChange={() => setOrigem(k)} />)}
            </div>
            {!novo && !erro?.origem && <span className="help">Este registro está como "Não classificado". Escolha uma origem para salvar.</span>}
          </div>
          <div className="f">
            <span className="lbl">6. Classificação de prioridade <em>*</em></span>
            <div className="opt-grid c3" role="radiogroup" aria-label="Classificação">
              {PRIO_KEYS.map((k) => <Opcao key={k} name="prio" value={k} info={{ ...PRIO[k], nome: PRIO[k].nome.toUpperCase() }} checked={prioridade === k} onChange={() => setPrio(k)} />)}
            </div>
          </div>
          <div className="f h">
            <label htmlFor="f-ref">7. Questão de referência <span style={{ fontWeight: 500, color: "var(--muted)" }}>(opcional)</span></label>
            <input className="in" id="f-ref" placeholder="Nº, banca ou link" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
          </div>
          <div className="f h">
            <label htmlFor="f-data">8. Data do registro</label>
            <input className="in" type="date" id="f-data" value={dataRegistro} onChange={(e) => setData(e.target.value)} />
            <span className="help">Preenchida automaticamente com a data de hoje ({fmt(today())}).</span>
          </div>
        </div>
        <div className="modal-ft">
          <button type="button" className="btn btn-ghost" onClick={fechar}>Cancelar</button>
          <button type="submit" className="btn btn-primary"><Icon name="check" />{novo ? "SALVAR ERRO" : "SALVAR ALTERAÇÕES"}</button>
        </div>
      </form>
    </Overlay>
  );
}

/* ---------- Detalhes e histórico ---------- */
function rotuloHist(x: HistItem) {
  const p = (k?: string) => (k && k in PRIO ? PRIO[k as Prioridade].curto : "—");
  const o = (k?: string) => origemInfo(k && k in ORIG ? (k as OrigemValida) : "nc").nome;
  switch (x.tipo) {
    case "criado": return `Registrado como ${p(x.para).toLowerCase()}`;
    case "prioridade": return `Classificação: ${p(x.de)} → ${p(x.para)}`;
    case "origem": return `Origem: ${o(x.de)} → ${o(x.para)}`;
    case "revisao": return `Revisado no segundo ciclo (${p(x.para)})`;
    default: return "Registro editado";
  }
}
function Referencia({ r }: { r: string }) {
  return <div className="box neutral"><small>Questão de referência</small>{isUrl(r) ? <a href={r} target="_blank" rel="noopener noreferrer">{r}</a> : r}</div>;
}

export function Detalhe({ id }: { id: string }) {
  const { items, fechar, abrir } = useApp();
  const e = items.find((x) => x.id === id);
  if (!e) return null;
  const hist = [...(e.historico || [])].reverse().slice(0, 8);
  return (
    <Overlay onClose={fechar} labelledBy="dTitle">
      <div className="modal-hd">
        <div style={{ minWidth: 0 }}><div className="eyebrow" style={{ letterSpacing: ".08em" }}>{e.materia}</div><h2 id="dTitle">{e.topico}</h2></div>
        <Fechar onClick={fechar} />
      </div>
      <div className="modal-bd">
        <div className="chips" style={{ gridColumn: "span 6" }}>
          <PrioChip e={e} /><OrigemChip e={e} />
          <span className="chip"><Icon name="cal" size={13} />{fmt(e.dataRegistro)}</span>
          {e.revisoes > 0 && <span className="chip"><Icon name="repeat" size={13} />{plural(e.revisoes, "revisão", "revisões")}</span>}
        </div>
        <div className="box wrong"><small>Descrição do erro</small>{e.descricao || "—"}</div>
        <div className="box right"><small>Correção / entendimento correto</small>{e.correcao || "—"}</div>
        <div className="box tip"><small>Como evitar esse erro novamente</small>{e.comoEvitar || "—"}</div>
        {e.referencia && <Referencia r={e.referencia} />}
        {hist.length > 0 && (
          <div className="hist"><b style={{ color: "var(--ink)" }}>Histórico</b>
            <ol>{hist.map((h, i) => <li key={i}><span className="num">{fmtShort(h.d)}</span> · {rotuloHist(h)}</li>)}</ol>
          </div>
        )}
      </div>
      <div className="modal-ft">
        <button type="button" className="btn btn-ghost" onClick={() => abrir({ kind: "form", erro: e })}><Icon name="edit" size={16} />Editar</button>
        {prio(e) !== "superado" && <button type="button" className="btn btn-violet" onClick={() => abrir({ kind: "review", queue: [e.id], idx: 0 })}><Icon name="eye" size={16} />Revisar erro</button>}
        <button type="button" className="btn btn-primary" onClick={fechar}>Fechar</button>
      </div>
    </Overlay>
  );
}

/* ---------- Revisão do segundo ciclo ---------- */
export function Revisao({ queue, idx }: { queue: string[]; idx: number }) {
  const { items, salvar, fechar, abrir, notify } = useApp();
  const [mostrar, setMostrar] = useState(false);
  useEffect(() => setMostrar(false), [idx]);
  const e = items.find((x) => x.id === queue[idx]);
  if (!e) return null;
  const p = prio(e);
  const temProximo = idx < queue.length - 1;
  const rotulo = (k: Prioridade) =>
    k === p ? (k === "alta" ? "Manter prioridade alta" : "Manter prioridade média")
      : k === "superado" ? "Marcar como superado" : k === "media" ? "Alterar para média" : "Voltar para alta";

  const decidir = (dec: Prioridade) => {
    const n = clone(e);
    n.revisoes = (n.revisoes || 0) + 1;
    n.ultimaRevisao = today();
    logH(n, "revisao", { de: p, para: dec });
    setPrioridade(n, dec);
    delete n.exemplo;
    salvar(n);
    notify(dec === "superado" ? "Erro superado! O registro fica guardado com o histórico." : dec === p ? "Revisão registrada." : `Alterado para ${PRIO[dec].nome.toLowerCase()}.`);
    if (temProximo) abrir({ kind: "review", queue, idx: idx + 1 });
    else {
      fechar();
      if (queue.length > 1) notify(`Sequência concluída: ${plural(queue.length, "erro revisado", "erros revisados")}.`);
    }
  };

  return (
    <Overlay onClose={fechar} labelledBy="rTitle">
      <div className="modal-hd">
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ letterSpacing: ".08em" }}>Revisar erro{queue.length > 1 ? ` · ${idx + 1} de ${queue.length}` : ""}</div>
          <h2 id="rTitle">{e.materia} › {e.topico}</h2>
        </div>
        <Fechar onClick={fechar} />
      </div>
      <div className="modal-bd">
        <div className="chips" style={{ gridColumn: "span 6" }}><PrioChip e={e} /><OrigemChip e={e} /><span className="chip"><Icon name="cal" size={13} />{fmt(e.dataRegistro)}</span></div>
        <div className="box wrong"><small>O que você errou</small>{e.descricao || "—"}</div>
        {e.referencia && <Referencia r={e.referencia} />}
        {mostrar ? (
          <>
            <div className="box right"><small>Correção / entendimento correto</small>{e.correcao || "—"}</div>
            <div className="box tip"><small>Como evitar esse erro novamente</small>{e.comoEvitar || "—"}</div>
            <div className="f" style={{ marginTop: 4 }}>
              <span className="lbl">Depois de revisar, como fica este erro?</span>
              <div className="rev-acts">
                {PRIO_KEYS.map((k) => (
                  <button key={k} type="button" className="btn" style={{ background: PRIO[k].cor }} onClick={() => decidir(k)}>
                    <Icon name={PRIO[k].icon} size={16} />{rotulo(k)}
                  </button>
                ))}
              </div>
              <span className="help">Marcar como superado não exclui o registro: ele continua no caderno com o histórico.</span>
            </div>
          </>
        ) : (
          <div className="hidden-ans">
            <p>Tente lembrar a correção e o macete antes de ver.</p>
            <button type="button" className="btn btn-primary" autoFocus onClick={() => setMostrar(true)}><Icon name="eye" size={16} />REVELAR CORREÇÃO</button>
          </div>
        )}
      </div>
      <div className="modal-ft">
        {temProximo && <button type="button" className="btn btn-ghost" onClick={() => abrir({ kind: "review", queue, idx: idx + 1 })}>Pular</button>}
        <button type="button" className="btn btn-ghost" onClick={fechar}>Fechar</button>
      </div>
    </Overlay>
  );
}

/* ---------- Confirmação ---------- */
export function Confirmar({ title, body, okLabel, onOk }: { title: string; body: ReactNode; okLabel: string; onOk: () => void | Promise<void> }) {
  const { fechar } = useApp();
  return (
    <Overlay onClose={fechar} labelledBy="cTitle" role="alertdialog" className="confirm">
      <div className="modal-hd"><h2 id="cTitle">{title}</h2></div>
      <div className="modal-bd">{body}</div>
      <div className="modal-ft">
        <button type="button" className="btn btn-ghost" onClick={fechar}>Cancelar</button>
        <button type="button" className="btn btn-danger" autoFocus onClick={async () => { fechar(); await onOk(); }}><Icon name="trash" size={16} />{okLabel}</button>
      </div>
    </Overlay>
  );
}
