import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Google AdSense: com VITE_ADSENSE_CLIENT (ca-pub-…), coloca no <head> a meta tag de verificação
 * e o script de anúncios, e gera o ads.txt na raiz do site. Sem o código, não faz nada.
 */
function adsense(client: string): Plugin {
  const ativo = /^ca-pub-\d{10,20}$/.test(client);
  return {
    name: "adsense",
    transformIndexHtml() {
      if (!ativo) return;
      return [
        { tag: "meta", attrs: { name: "google-adsense-account", content: client }, injectTo: "head" },
        { tag: "script", attrs: { async: true, src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`, crossorigin: "anonymous" }, injectTo: "head" }
      ];
    },
    generateBundle() {
      if (!ativo) return;
      this.emitFile({ type: "asset", fileName: "ads.txt", source: `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n` });
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    adsense((loadEnv(mode, ".", "VITE_").VITE_ADSENSE_CLIENT || "").trim()),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "avatar.webp", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Caderno de Erros — Ana Karolina",
        short_name: "Caderno de Erros",
        description: "Uma ferramenta para transformar erros em acertos.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#F3F5FE",
        theme_color: "#3152E6",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webp,svg,woff2}"],
        navigateFallback: "/index.html",
        // O ads.txt precisa chegar como arquivo de texto, não como a página do app.
        navigateFallbackDenylist: [/^\/ads\.txt$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: { cacheName: "fontes", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ]
}));
