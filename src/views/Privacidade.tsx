import { CONTATO_EMAIL } from "../constants";

const ATUALIZADA = "4 de novembro de 2026";

export function Privacidade() {
  return (
    <main className="landing doc">
      <a className="linkbtn" href="/">← Voltar ao Caderno de Erros</a>
      <article className="card">
        <div className="eyebrow">Caderno de Erros</div>
        <h1>Política de privacidade</h1>
        <p className="sub">Última atualização: {ATUALIZADA}</p>

        <h2>Quais dados o site guarda</h2>
        <ul>
          <li><b>Conta Google.</b> Ao entrar, recebemos do Google o seu nome, e-mail e foto de perfil. Eles servem só para identificar o seu caderno e mostrar o seu nome na tela.</li>
          <li><b>Registros de estudo.</b> Os erros, tópicos, revisões e matérias que você cadastra ficam no Google Firebase, ligados à sua conta. As regras do banco de dados permitem que só a sua conta leia e altere esses registros.</li>
          <li><b>Armazenamento do navegador.</b> Uma cópia dos registros fica no próprio aparelho para o site funcionar sem internet.</li>
        </ul>

        <h2>Anúncios e cookies</h2>
        <p>O site pode exibir anúncios do Google AdSense. O Google e seus parceiros usam cookies para mostrar anúncios com base nas visitas a este e a outros sites. Os anúncios não têm acesso aos seus registros de estudo.</p>
        <ul>
          <li>Entenda como o Google usa esses dados em <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.</li>
          <li>Desative os anúncios personalizados em <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer">myadcenter.google.com</a>.</li>
        </ul>

        <h2>Seus direitos</h2>
        <p>Pela Lei Geral de Proteção de Dados (Lei n.º 13.709/2018), você pode acessar, corrigir, exportar e apagar os seus dados.</p>
        <ul>
          <li>Para exportar, use <b>Backup e configurações → Exportar backup</b>.</li>
          <li>Para apagar os registros, use <b>Backup e configurações → Apagar todos os erros</b>.</li>
          <li>Para desligar o acesso da sua conta Google, use <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">myaccount.google.com/connections</a>.</li>
        </ul>

        <h2>Compartilhamento</h2>
        <p>Não vendemos nem compartilhamos os seus registros de estudo com ninguém. Os dados ficam nos serviços do Google usados pelo site: Firebase, para login e banco de dados, e AdSense, para anúncios.</p>

        {CONTATO_EMAIL && (
          <>
            <h2>Contato</h2>
            <p>Dúvidas ou pedidos sobre os seus dados: <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a>.</p>
          </>
        )}
      </article>
    </main>
  );
}
