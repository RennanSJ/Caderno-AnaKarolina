/**
 * Google AdSense. Fica desligado até VITE_ADSENSE_CLIENT receber o código de editor (ca-pub-…).
 * VITE_ADSENSE_SLOT é o ID do bloco de anúncio criado no painel do AdSense.
 * O script, a meta tag de verificação e o ads.txt são gerados na build (vite.config.ts).
 */
export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT || "").trim();
export const ADSENSE_SLOT = (import.meta.env.VITE_ADSENSE_SLOT || "").trim();
export const anunciosAtivos = /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT);
