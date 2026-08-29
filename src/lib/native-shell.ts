import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return;
  document.documentElement.dataset.platform = Capacitor.getPlatform();
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  await StatusBar.setBackgroundColor({ color: "#111111" }).catch(() => undefined);
  await Keyboard.setResizeMode({ mode: "body" }).catch(() => undefined);
  await App.addListener("appUrlOpen", ({ url }) => {
    const parsed = new URL(url);
    window.history.pushState({}, "", parsed.pathname + parsed.search + parsed.hash);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}
