import { createRootRoute, HeadContent, Scripts, Outlet } from "@tanstack/react-router";
import { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FINANZZI — inteligência para o seu dinheiro" },
      {
        name: "description",
        content: "Controle financeiro inteligente, simples e seguro.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('finanzzi-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark'){document.documentElement.classList.add('dark');}document.documentElement.style.colorScheme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

function NotFoundComponent() {
  return (
    <main className="min-h-screen grid place-items-center bg-background p-6 text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">A página que você procura não existe.</p>
      </div>
    </main>
  );
}

function ErrorComponent() {
  return (
    <main className="min-h-screen grid place-items-center bg-background p-6 text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Algo deu errado</h1>
        <p className="mt-2 text-muted-foreground">Tente recarregar a página.</p>
      </div>
    </main>
  );
}
