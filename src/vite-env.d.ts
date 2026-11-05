/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /** Código de editor do AdSense, no formato ca-pub-1234567890123456. */
  readonly VITE_ADSENSE_CLIENT?: string;
  /** ID do bloco de anúncio criado no painel do AdSense. */
  readonly VITE_ADSENSE_SLOT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
