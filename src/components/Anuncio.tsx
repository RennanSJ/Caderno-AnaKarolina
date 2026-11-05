import { useEffect, useState } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT, anunciosAtivos } from "../lib/ads";
import { lsGet, lsSet } from "../lib/utils";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/** Bloco de anúncio do AdSense. Não aparece enquanto o código de editor e o bloco não estiverem configurados. */
export function Anuncio() {
  const ativo = anunciosAtivos && !!ADSENSE_SLOT;
  useEffect(() => {
    if (!ativo) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* bloqueador de anúncios ou bloco já preenchido */
    }
  }, [ativo]);
  if (!ativo) return null;
  return (
    <aside className="ad" aria-label="Publicidade">
      <span className="ad-lb">Publicidade</span>
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}

const CHAVE = "caderno:aviso-cookies";

/** Aviso de cookies de publicidade, exigido pela LGPD. Só aparece com o AdSense ligado. */
export function AvisoCookies() {
  const [visto, setVisto] = useState(() => lsGet<boolean>(CHAVE, false));
  if (!anunciosAtivos || visto) return null;
  return (
    <div className="cookies" role="region" aria-label="Aviso de cookies">
      <p>Este site usa cookies do Google para exibir anúncios. Saiba mais na <a href="/privacidade">política de privacidade</a>.</p>
      <button className="btn btn-primary btn-sm" type="button" onClick={() => { lsSet(CHAVE, true); setVisto(true); }}>Entendi</button>
    </div>
  );
}
