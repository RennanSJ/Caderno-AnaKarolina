import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "./components/Icon";
import { Confirmar, Detalhe, ErroForm, Revisao } from "./components/Modals";
import { DONA, FRASES } from "./constants";
import { counts } from "./lib/caderno";
import { AppProvider, type AppCtx, type ModalState } from "./lib/context";
import { firebaseConfigurado, observarLogin, sair, type User } from "./lib/firebase";
import { useCaderno } from "./lib/useCaderno";
import { lsGet, lsSet } from "./lib/utils";
import { FILTROS_VAZIOS, type Filtros, type SyncState, type View } from "./types";
import { Backup } from "./views/Backup";
import { Ciclo } from "./views/Ciclo";
import { Dashboard } from "./views/Dashboard";
import { Evolucao } from "./views/Evolucao";
import { Login } from "./views/Login";
import { Materias } from "./views/Materias";
import { MeusErros } from "./views/MeusErros";

const VIEWS: View[] = ["dashboard", "erros", "ciclo", "evolucao", "materias", "backup"];
const NAV: Array<{ v: View | "novo"; label: string; icon: IconName }> = [
  { v: "dashboard", label: "Dashboard", icon: "home" },
  { v: "novo", label: "Registrar erro", icon: "plus" },
  { v: "erros", label: "Meus erros", icon: "book" },
  { v: "ciclo", label: "Segundo ciclo", icon: "repeat" },
  { v: "evolucao", label: "Minha evolução", icon: "trend" },
  { v: "materias", label: "Matérias e tópicos", icon: "layers" },
  { v: "backup", label: "Backup e configurações", icon: "gear" }
];
const SYNC: Record<SyncState, string> = {
  local: "Salvo neste aparelho",
  connecting: "Conectando…",
  synced: "Sincronizado com sua conta",
  pending: "Sincronizando…",
  offline: "Sem conexão · salvo neste aparelho",
  error: "Erro ao sincronizar"
};

const viewDoHash = (): View => {
  const h = window.location.hash.slice(1) as View;
  return VIEWS.includes(h) ? h : "dashboard";
};

function sortearFrase() {
  const ultima = lsGet<string>("caderno:ultima-frase", "");
  const pool = FRASES.filter((f) => f !== ultima);
  const f = pool[Math.floor(Math.random() * pool.length)];
  lsSet("caderno:ultima-frase", f);
  return f;
}

type Toast = { msg: string; tipo: "ok" | "erro" | "info"; id: number } | null;

function Caderno({ user }: { user: User | null }) {
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<number>();
  const notify = useCallback((msg: string, tipo: "ok" | "erro" | "info" = "ok") => {
    window.clearTimeout(timer.current);
    setToast({ msg, tipo, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), tipo === "erro" ? 4200 : 2800);
  }, []);

  const api = useCaderno(user?.uid ?? null, notify);
  const [view, setView] = useState<View>(viewDoHash);
  const [modal, setModal] = useState<ModalState>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [frase, setFrase] = useState(sortearFrase);

  useEffect(() => {
    const h = () => setView(viewDoHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const go = useCallback((v: View) => {
    setView(v);
    if (window.location.hash !== `#${v}`) history.replaceState(null, "", `#${v}`);
    document.querySelector(".tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const fechar = useCallback(() => setModal(null), []);
  const irParaTopico = useCallback((materia: string, topico: string) => {
    setFiltros({ ...FILTROS_VAZIOS, materia, topico });
    setModal(null);
    go("erros");
  }, [go]);

  const ctx: AppCtx = useMemo(() => ({
    ...api, notify, abrir: setModal, fechar, go, irParaTopico, filtros, setFiltros,
    frase, novaFrase: () => setFrase(sortearFrase()), temConta: Boolean(user)
  }), [api, notify, fechar, go, irParaTopico, filtros, frase, user]);

  const c = counts(api.items);

  return (
    <AppProvider value={ctx}>
      <div className="wrap">
        <header className="notebook">
          <div className="holes" aria-hidden="true"><span /><span /><span /></div>
          <div className="hd-top">
            <div className="brand">
              <div className="eyebrow">Preparação para concursos públicos</div>
              <h1>CADERNO DE ERROS</h1>
              <p className="tagline">Uma ferramenta para transformar erros em acertos.</p>
              <div className="owner"><span className="who">{DONA}</span></div>
            </div>
            <div className="hd-side">
              <div className="hd-meta">
                <span className={`sync ${api.sync}`} role="status"><span className="dot" />{SYNC[api.sync]}</span>
                {user && (
                  <span className="userchip">
                    {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
                    <span>{user.displayName || user.email}</span>
                    <button type="button" onClick={() => sair()} title="Sair da conta"><Icon name="logout" size={14} />Sair</button>
                  </span>
                )}
              </div>
              <button className="cta" type="button" onClick={() => setModal({ kind: "form" })}><Icon name="plus" size={20} />REGISTRAR NOVO ERRO</button>
            </div>
          </div>
          {!firebaseConfigurado && (
            <div className="notice info">
              <Icon name="info" size={16} />A sincronização com a conta ainda não foi configurada. Os registros ficam salvos neste navegador. Siga o guia de instalação para ativar.
            </div>
          )}
        </header>

        <nav className="tabs" aria-label="Seções">
          {NAV.map((n) => n.v === "novo" ? (
            <button key={n.v} className="tab tab-new" type="button" onClick={() => setModal({ kind: "form" })}><Icon name={n.icon} />{n.label}</button>
          ) : (
            <button key={n.v} className="tab" type="button" aria-current={view === n.v ? "page" : undefined} onClick={() => go(n.v as View)}>
              <Icon name={n.icon} />{n.label}
              {n.v === "ciclo" && c.alta > 0 && <span className="badge num">{c.alta}</span>}
            </button>
          ))}
        </nav>

        <main className="view" key={view}>
          {view === "dashboard" && <Dashboard />}
          {view === "erros" && <MeusErros />}
          {view === "ciclo" && <Ciclo />}
          {view === "evolucao" && <Evolucao />}
          {view === "materias" && <Materias />}
          {view === "backup" && <Backup />}
        </main>
      </div>

      <button className="fab" type="button" aria-label="Registrar novo erro" onClick={() => setModal({ kind: "form" })}><Icon name="plus" size={24} /></button>

      {modal?.kind === "form" && <ErroForm key={modal.erro?.id || "novo"} erro={modal.erro} />}
      {modal?.kind === "detail" && <Detalhe id={modal.id} />}
      {modal?.kind === "review" && <Revisao queue={modal.queue} idx={modal.idx} />}
      {modal?.kind === "confirm" && <Confirmar title={modal.title} body={modal.body} okLabel={modal.okLabel} onOk={modal.onOk} />}

      {toast && (
        <div key={toast.id} className={`toast ${toast.tipo === "erro" ? "erro" : ""}`} role="status">
          <Icon name={toast.tipo === "erro" ? "alert" : toast.tipo === "info" ? "info" : "check"} />{toast.msg}
        </div>
      )}
    </AppProvider>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [pronto, setPronto] = useState(!firebaseConfigurado);
  useEffect(() => observarLogin((u) => { setUser(u); setPronto(true); }), []);

  if (!pronto)
    return <div className="login"><p className="sub">Abrindo seu caderno…</p></div>;
  if (firebaseConfigurado && !user) return <Login />;
  return <Caderno key={user?.uid || "local"} user={user} />;
}
