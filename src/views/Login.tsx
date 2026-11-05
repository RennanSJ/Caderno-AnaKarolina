import { useState } from "react";
import { Anuncio, AvisoCookies } from "../components/Anuncio";
import { Icon } from "../components/Icon";
import { DONA, EDITAL_NOME, EDITAL_TJSP, ORIG, ORIG_KEYS, PRIO, PRIO_KEYS } from "../constants";
import { entrarComGoogle } from "../lib/firebase";
import { plural } from "../lib/utils";

const PASSOS = [
  { t: "Registre o erro", d: "Anote a matéria, o tópico, o que você errou, a correção e como evitar o mesmo erro na próxima questão." },
  { t: "Descubra a origem", d: "Classifique se o erro veio de desconhecimento, confusão entre conceitos, esquecimento ou interpretação do enunciado." },
  { t: "Revise no segundo ciclo", d: "Volte aos erros de prioridade alta, refaça as questões e marque como superado quando dominar o conteúdo." }
];

export function Login() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const entrar = async () => {
    setErro("");
    setCarregando(true);
    try {
      await entrarComGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code || "";
      setErro(code === "auth/unauthorized-domain"
        ? "Este endereço ainda não está autorizado no Firebase. Veja o passo 4 do guia de instalação."
        : code === "auth/network-request-failed"
          ? "Sem conexão com a internet. Conecte-se e tente de novo."
          : "Não foi possível entrar. Tente de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  };
  const totalTopicos = Object.values(EDITAL_TJSP).reduce((n, t) => n + t.length, 0);

  return (
    <main className="landing">
      <div className="login-card">
        <div className="art"><img src="/avatar.webp" alt={`Ilustração da ${DONA} estudando`} /></div>
        <div className="body">
          <div className="eyebrow">Preparação para concursos públicos</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,46px)", fontWeight: 800, lineHeight: 1, background: "linear-gradient(100deg,var(--blue),var(--violet))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            CADERNO DE ERROS
          </h1>
          <p className="sub" style={{ fontSize: 16, margin: 0 }}>Uma ferramenta para transformar erros em acertos.</p>
          <p style={{ margin: 0, fontSize: 14.5 }}>Entre com a sua conta Google para ver os mesmos registros no computador, no celular e no tablet.</p>
          <button className="gbtn" onClick={entrar} disabled={carregando}>
            <Icon name="google" size={20} />{carregando ? "Abrindo o Google…" : "Entrar com Google"}
          </button>
          {erro && <div className="notice" role="alert">{erro}</div>}
          <p className="sub" style={{ fontSize: 12.5, margin: 0 }}>Seu caderno é privado: só a conta que entrar consegue ver e alterar os próprios registros.</p>
        </div>
      </div>

      <section className="card">
        <h2>Como funciona o caderno de erros</h2>
        <p className="sub">Estudar pelos próprios erros mostra exatamente onde está a dificuldade. O caderno organiza esse processo em três etapas.</p>
        <ol className="passos">
          {PASSOS.map((p, i) => (
            <li key={p.t}><span className="n num">{i + 1}</span><div><b>{p.t}</b><p>{p.d}</p></div></li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>Classificação por prioridade</h2>
        <p className="sub">Cada erro recebe uma prioridade, que define o que revisar primeiro.</p>
        <div className="tipos">
          {PRIO_KEYS.map((k) => (
            <div key={k} className="tipo" style={{ background: PRIO[k].soft }}>
              <b style={{ color: PRIO[k].cor }}><Icon name={PRIO[k].icon} size={16} />{PRIO[k].nome}</b>
              <p>{PRIO[k].desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>A origem de cada erro</h2>
        <p className="sub">Saber por que você errou indica o que mudar no estudo.</p>
        <div className="tipos">
          {ORIG_KEYS.map((k) => (
            <div key={k} className="tipo" style={{ background: ORIG[k].soft }}>
              <b style={{ color: ORIG[k].cor }}><Icon name={ORIG[k].icon} size={16} />{ORIG[k].nome}</b>
              <p>{ORIG[k].desc} <span className="sub">{ORIG[k].ex}</span></p>
              <p className="dica">{ORIG[k].dica}</p>
            </div>
          ))}
        </div>
      </section>

      <Anuncio />

      <section className="card">
        <h2>Edital verticalizado: {EDITAL_NOME}</h2>
        <p className="sub">
          {plural(Object.keys(EDITAL_TJSP).length, "matéria", "matérias")} e {plural(totalTopicos, "tópico", "tópicos")}, organizados para estudo. Dentro do caderno, um botão adiciona todos eles às suas matérias. Confira sempre o edital oficial do TJSP.
        </p>
        <div className="edital">
          {Object.entries(EDITAL_TJSP).map(([m, ts]) => (
            <details key={m}>
              <summary><b>{m}</b><span className="sub">{plural(ts.length, "tópico", "tópicos")}</span></summary>
              <ol>{ts.map((t) => <li key={t}>{t}</li>)}</ol>
            </details>
          ))}
        </div>
      </section>

      <footer className="rodape"><a href="/privacidade">Política de privacidade</a></footer>
      <AvisoCookies />
    </main>
  );
}
