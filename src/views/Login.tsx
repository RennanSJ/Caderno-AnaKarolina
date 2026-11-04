import { useState } from "react";
import { Icon } from "../components/Icon";
import { DONA } from "../constants";
import { entrarComGoogle } from "../lib/firebase";

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
  return (
    <main className="login">
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
    </main>
  );
}
