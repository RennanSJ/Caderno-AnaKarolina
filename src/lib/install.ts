import { useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// O navegador dispara este evento uma vez, logo ao abrir. Guardamos para usar depois.
let pendente: BeforeInstallPromptEvent | null = null;
const ouvintes = new Set<(e: BeforeInstallPromptEvent | null) => void>();

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  pendente = e as BeforeInstallPromptEvent;
  ouvintes.forEach((f) => f(pendente));
});
window.addEventListener("appinstalled", () => {
  pendente = null;
  ouvintes.forEach((f) => f(null));
});

export function useInstalar() {
  const [ev, setEv] = useState<BeforeInstallPromptEvent | null>(pendente);
  useEffect(() => {
    ouvintes.add(setEv);
    return () => { ouvintes.delete(setEv); };
  }, []);
  const instalar = async () => {
    if (!pendente) return;
    await pendente.prompt();
    pendente = null;
    setEv(null);
  };
  return { podeInstalar: Boolean(ev), instalar };
}
