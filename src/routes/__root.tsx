/* eslint-disable prettier/prettier */
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { initObservability, captureTelemetry } from "../lib/observability";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() { return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2><p className="mt-2 text-sm text-muted-foreground">A página que você procura não existe ou foi movida.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Voltar ao início</Link></div></div></div>; }
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) { console.error(error); const router = useRouter(); useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); captureTelemetry("ui.root_error", { name: error.name, message: error.message.slice(0, 180) }, "error"); }, [error]); return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">Não foi possível carregar esta página</h1><p className="mt-2 text-sm text-muted-foreground">Algo não carregou como esperado. Tente novamente ou volte ao início.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Tentar novamente</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Voltar ao início</a></div></div></div>; }

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    { title: "FINANZZI — Inteligência para o seu dinheiro" },
    { name: "description", content: "Organize receitas, despesas, contas, cartões e metas em um só lugar e entenda para onde seu dinheiro está indo." },
    { name: "author", content: "FINANZZI" },
    { property: "og:title", content: "FINANZZI — Inteligência para o seu dinheiro" },
    { property: "og:description", content: "Organizador financeiro pessoal com análises automáticas dos seus próprios dados." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "theme-color", content: "#111111" },
    { name: "msapplication-TileColor", content: "#111111" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-title", content: "FINANZZI" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ], links: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" },
    { rel: "stylesheet", href: appCss },
    { rel: "icon", href: "/brand/logo/finanzzi-logo.svg?v=brand-orange-5", type: "image/svg+xml" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/brand/logo/finanzzi-logo.png?v=brand-orange-5" },
    { rel: "manifest", href: "/manifest.webmanifest?v=brand-orange-5" },
  ] }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// biome-ignore lint/security/noDangerouslySetInnerHtml: fixed boot scripts contain no user-controlled input.
function RootShell({ children }: { children: ReactNode }) {
  return <html lang="pt-BR" className="dark" suppressHydrationWarning><head><HeadContent /><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';localStorage.setItem('finanzzi-theme','dark')}catch(e){}` }} /><script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js?v=brand-orange-5').catch(function(){});});}` }} /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { initObservability(); }, []);
  return <QueryClientProvider client={queryClient}><ThemeProvider><AuthProvider><Outlet /><Toaster position="top-center" richColors /></AuthProvider></ThemeProvider></QueryClientProvider>;
}
