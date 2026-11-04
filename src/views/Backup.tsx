import { useRef, type ReactNode } from "react";
import { Icon, type IconName } from "../components/Icon";
import { allMaterias, catWith, lerBackup, montarBackup } from "../lib/caderno";
import { useApp } from "../lib/context";
import { useInstalar } from "../lib/install";
import { LOCAL_ERROS } from "../lib/useCaderno";
import { lsGet, plural, today } from "../lib/utils";
import type { Catalogo, Erro, SyncState } from "../types";

function Linha({ icon, bg, fg, titulo, texto, acao }: { icon: IconName; bg: string; fg: string; titulo: string; texto: ReactNode; acao?: ReactNode }) {
  return (
    <div className="set-row">
      <span className="ico" style={{ background: bg, color: fg }}><Icon name={icon} size={20} /></span>
      <div className="tx"><b>{titulo}</b><span>{texto}</span></div>
      {acao}
    </div>
  );
}

const SYNC_TEXTO: Record<SyncState, string> = {
  local: "Sem conta conectada. Os dados ficam só neste aparelho; use o backup para levar a outro.",
  connecting: "Conectando à sua conta…",
  synced: "Sincronizado. Entre com a mesma conta Google em outro aparelho para ver os mesmos registros.",
  pending: "Enviando as últimas alterações para a sua conta…",
  offline: "Sem internet agora. As alterações ficam salvas neste aparelho e sobem sozinhas quando a conexão voltar.",
  error: "A conta recusou a sincronização. Confira as regras do Firestore no passo a passo de instalação."
};

export function Backup() {
  const { items, cat, sync, salvarVarios, salvarCatalogo, remover, abrir, notify, temConta } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const { podeInstalar, instalar } = useInstalar();
  const exemplos = items.filter((e) => e.exemplo);
  const locais = temConta ? lsGet<Erro[]>(LOCAL_ERROS, []) : [];
  const locaisNovos = Array.isArray(locais) ? locais.filter((l) => l && l.id && !items.some((i) => i.id === l.id)) : [];

  const exportar = () => {
    const blob = new Blob([JSON.stringify(montarBackup(items, cat), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caderno-de-erros-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    notify("Backup exportado.");
  };

  const importar = async (file: File) => {
    try {
      const r = lerBackup(await file.text(), items, cat);
      let c: Catalogo = cat;
      r.materias.forEach(([m, ts]) => { c = catWith(c, m) || c; ts.forEach((t) => (c = catWith(c, m, t) || c)); });
      if (c !== cat) salvarCatalogo(c);
      if (!r.erros.length && !r.duplicados) {
        notify(r.invalidos ? "Nenhum registro válido no arquivo: faltam matéria, tópico ou descrição." : "O arquivo não tem registros.", "erro");
        return;
      }
      await salvarVarios(r.erros);
      notify(`${plural(r.erros.length, "erro importado", "erros importados")}${r.duplicados ? ` · ${r.duplicados} já existiam` : ""}${r.invalidos ? ` · ${r.invalidos} inválidos ignorados` : ""}.`);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Arquivo inválido.", "erro");
    }
  };

  return (
    <div className="grid gap-4 cols-2e">
      <div className="card">
        <h2>Armazenamento e sincronização</h2>
        <div className="sub">Onde seus registros ficam guardados</div>
        <Linha icon="device" bg="var(--blue-soft)" fg="var(--blue)" titulo="Neste aparelho"
          texto="Cada alteração é gravada no navegador na hora. Os dados continuam aqui depois de fechar a página ou desligar o computador." />
        <Linha icon="cloud" bg={sync === "synced" ? "var(--sup-soft)" : "var(--media-soft)"} fg={sync === "synced" ? "var(--sup)" : "var(--media)"}
          titulo="Na sua conta" texto={SYNC_TEXTO[sync]} />
        {locaisNovos.length > 0 && (
          <Linha icon="up" bg="var(--violet-soft)" fg="var(--violet)" titulo="Erros salvos sem login"
            texto={`${plural(locaisNovos.length, "registro foi criado", "registros foram criados")} neste aparelho antes de entrar com a conta.`}
            acao={<button className="btn btn-ghost btn-sm" onClick={async () => { await salvarVarios(locaisNovos); notify("Registros enviados para a sua conta."); }}>Enviar para a conta</button>} />
        )}
        <Linha icon="device" bg="var(--violet-soft)" fg="var(--violet)" titulo="Instalar como aplicativo"
          texto={podeInstalar ? "Instale o caderno para abrir com um ícone, como um app, inclusive sem internet."
            : "No celular, abra o menu do navegador e toque em “Adicionar à tela de início” ou “Instalar app”."}
          acao={podeInstalar ? <button className="btn btn-primary btn-sm" onClick={instalar}><Icon name="down" size={16} />Instalar</button> : undefined} />
      </div>

      <div className="card">
        <h2>Backup</h2>
        <div className="sub">Arquivo JSON com erros, matérias, tópicos, classificações, origens, datas e histórico</div>
        <Linha icon="down" bg="var(--blue-soft)" fg="var(--blue)" titulo="Exportar backup"
          texto={`${plural(items.length, "erro", "erros")} e ${plural(allMaterias(items, cat).length, "matéria", "matérias")} em um arquivo .json.`}
          acao={<button className="btn btn-primary btn-sm" onClick={exportar}><Icon name="down" size={16} />Exportar</button>} />
        <Linha icon="up" bg="var(--violet-soft)" fg="var(--violet)" titulo="Importar backup"
          texto={"Adiciona os registros do arquivo sem apagar os atuais. Registros sem origem entram como “Não classificado”."}
          acao={<>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}><Icon name="up" size={16} />Importar</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importar(f); }} />
          </>} />
        {exemplos.length > 0 && (
          <Linha icon="x" bg="var(--media-soft)" fg="var(--media)" titulo="Registros de exemplo" texto={`${plural(exemplos.length, "registro de exemplo", "registros de exemplo")} no caderno.`}
            acao={<button className="btn btn-ghost btn-sm" onClick={() => abrir({
              kind: "confirm", title: "Remover os exemplos?", okLabel: "Remover",
              body: <p style={{ margin: 0 }}>{plural(exemplos.length, "registro de exemplo será apagado", "registros de exemplo serão apagados")}. Seus próprios erros continuam no caderno.</p>,
              onOk: () => { remover(exemplos.map((e) => e.id)); notify("Exemplos removidos."); }
            })}>Remover exemplos</button>} />
        )}
        {items.length > 0 && (
          <Linha icon="trash" bg="var(--alta-soft)" fg="var(--alta)" titulo="Apagar todos os erros" texto="Remove todos os registros deste caderno. Exporte um backup antes."
            acao={<button className="btn btn-ghost btn-sm" style={{ color: "var(--alta)" }} onClick={() => abrir({
              kind: "confirm", title: "Apagar todos os erros?", okLabel: "Apagar tudo",
              body: <p style={{ margin: 0 }}>Os <b style={{ color: "var(--ink)" }}>{plural(items.length, "registro", "registros")}</b> do caderno e o histórico deles serão apagados{temConta ? " neste aparelho e na sua conta" : ""}. Essa ação não pode ser desfeita.</p>,
              onOk: () => { remover(items.map((e) => e.id)); notify("Todos os erros foram apagados."); }
            })}>Apagar tudo</button>} />
        )}
      </div>
    </div>
  );
}
