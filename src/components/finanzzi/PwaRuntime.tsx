/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: fullscreen)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
}

export function PwaRuntime() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [offline, setOffline] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      if (localStorage.getItem("finanzzi-install-dismissed") !== "1" && !isStandalone()) {
        setShowInstall(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstall(false);
      setShowIOS(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isIOS() && !isStandalone() && localStorage.getItem("finanzzi-ios-install-dismissed") !== "1") {
      const timer = window.setTimeout(() => setShowIOS(true), 4500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const onControllerChange = () => window.location.reload();

    const register = async () => {
      registration = await navigator.serviceWorker.register("/sw.js?v=pwa-20260903-2", {
        updateViaCache: "none",
      });

      const setWaiting = () => {
        if (registration?.waiting) setWaitingWorker(registration.waiting);
      };

      setWaiting();
      registration.addEventListener("updatefound", () => {
        const installing = registration?.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting();
          }
        });
      });
    };

    void register().catch(() => undefined);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const dismissInstall = () => {
    localStorage.setItem("finanzzi-install-dismissed", "1");
    setShowInstall(false);
  };

  const dismissIOS = () => {
    localStorage.setItem("finanzzi-ios-install-dismissed", "1");
    setShowIOS(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const update = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {offline ? (
        <div
          className="fixed inset-x-3 top-3 z-[100] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg"
          role="status"
        >
          <span>Você está sem internet. Seus dados online serão atualizados quando a conexão voltar.</span>
        </div>
      ) : null}

      {waitingWorker ? (
        <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg">
          <span>Uma nova versão do FINANZZI está pronta.</span>
          <button
            type="button"
            onClick={update}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground"
          >
            Atualizar
          </button>
        </div>
      ) : null}

      {showInstall && deferredPrompt ? (
        <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-3xl border border-border bg-card p-5 shadow-xl">
          <p className="font-display text-base font-semibold text-card-foreground">Instale o FINANZZI</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Acesse direto pelo ícone do seu celular, em tela cheia e sem depender da barra do navegador.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Instalar app
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground"
            >
              Agora não
            </button>
          </div>
        </div>
      ) : null}

      {showIOS ? (
        <div className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-3xl border border-border bg-card p-5 shadow-xl">
          <p className="font-display text-base font-semibold text-card-foreground">Coloque o FINANZZI na tela inicial</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            No Safari, toque em Compartilhar e depois em <strong className="text-card-foreground">Adicionar à Tela de Início</strong>.
          </p>
          <button
            type="button"
            onClick={dismissIOS}
            className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground"
          >
            Entendi
          </button>
        </div>
      ) : null}
    </>
  );
}
