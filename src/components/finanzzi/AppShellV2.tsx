import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarClock, ChevronLeft, ChevronRight, CreditCard, Home, Menu, Plus, Settings, ShoppingBag, Target, Wallet, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { MotionPage } from "@/components/finanzzi/MotionPage";
import { NavigationLoading } from "@/components/finanzzi/NavigationLoading";
import { cn } from "@/lib/utils";

const TransactionDialog = lazy(() => import("@/components/finanzzi/TransactionDialog").then((module) => ({ default: module.TransactionDialog })));
export type NavItemDefinition = { to: string; label: string; icon: LucideIcon };
const NAV: readonly NavItemDefinition[] = [
  { to: "/dashboard", label: "Início", icon: Home }, { to: "/lancamentos", label: "Histórico", icon: Wallet },
  { to: "/contas", label: "Contas", icon: CalendarClock }, { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/metas", label: "Metas", icon: Target }, { to: "/relatorios", label: "Resumo", icon: BarChart3 },
  { to: "/posso-comprar", label: "Posso gastar", icon: ShoppingBag }, { to: "/configuracoes", label: "Configurações", icon: Settings },
];
function beginNavigation() { window.dispatchEvent(new CustomEvent("finanzzi:navigation-start")); }
function NavItem({ item, active, collapsed = false, onNavigate }: { item: NavItemDefinition; active: boolean; collapsed?: boolean; onNavigate?: () => void }) {
  return <Link to={item.to} onClick={() => { if (!active) beginNavigation(); onNavigate?.(); }} title={collapsed ? item.label : undefined} className={cn("fin-interactive fin-pressable group flex min-h-11 items-center rounded-xl py-2.5 text-sm font-semibold transition-colors", collapsed ? "justify-center px-2" : "gap-3 px-3", active ? "bg-fin-brand-soft text-fin-brand-hover" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground")}><item.icon className="size-4" strokeWidth={active ? 2.2 : 1.9} /></span>
    {!collapsed && <span className="truncate">{item.label}</span>}
  </Link>;
}
function MobileDrawer({ activePathname, onClose }: { activePathname: string; onClose: () => void }) {
  return <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu FINANZZI">
    <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
    <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col border-r border-border bg-card shadow-2xl animate-in slide-in-from-left duration-200" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-border px-5"><Link to="/dashboard" onClick={onClose} aria-label="FINANZZI"><Logo /></Link><button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Fechar menu"><X className="size-5" /></button></div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5" style={{ WebkitOverflowScrolling: "touch" }}><div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fin-brand-hover">Navegação</div><div className="space-y-1">{NAV.map((item) => <NavItem key={item.to} item={item} active={activePathname === item.to} onNavigate={onClose} />)}</div></nav>
      <div className="shrink-0 border-t border-border px-4 py-4"><p className="px-2 text-xs text-muted-foreground">Sua vida financeira, em um só lugar.</p></div>
    </aside>
  </div>;
}
export function AppShellV2({ children, visualReview = false }: { children: ReactNode; visualReview?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activePathname = visualReview && pathname === "/visual-review/dashboard" ? "/dashboard" : pathname;
  const { data: profile, isLoading, isInternalTest } = usePlan();
  const [transactionOpen, setTransactionOpen] = useState(false); const [drawerOpen, setDrawerOpen] = useState(false); const [sidebarCollapsed, setSidebarCollapsed] = useState(false); const navigate = useNavigate();
  useEffect(() => { window.dispatchEvent(new CustomEvent("finanzzi:navigation-end", { detail: pathname })); }, [pathname]);
  useEffect(() => { if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas") void navigate({ to: "/boas-vindas" }); }, [profile, isLoading, pathname, navigate]);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => { if (!drawerOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [drawerOpen]);
  if (pathname === "/boas-vindas") return children;
  const desktopSidebarWidth = sidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[256px]"; const isHome = activePathname === "/dashboard";
  return <div data-fin-app-shell className="flex h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-background text-foreground"><NavigationLoading />
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card fin-layout-transition", sidebarCollapsed ? "w-[88px]" : "w-[256px]")}>
      <div className={cn("flex h-[78px] shrink-0 items-center border-b border-border", sidebarCollapsed ? "justify-center px-3" : "px-5")}><Link to="/dashboard" aria-label="FINANZZI">{sidebarCollapsed ? <Logo compact /> : <Logo />}</Link></div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5"><div className="space-y-1">{NAV.map((item) => <NavItem key={item.to} item={item} active={activePathname === item.to} collapsed={sidebarCollapsed} />)}</div></nav>
      <div className="shrink-0 border-t border-border p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}><Button className={cn("h-11 rounded-xl shadow-sm fin-interactive fin-pressable", sidebarCollapsed ? "w-11 justify-center px-0" : "w-full")} onClick={() => !visualReview && setTransactionOpen(true)} title={sidebarCollapsed ? "Registrar" : undefined}><Plus className="size-4" />{!sidebarCollapsed && "Registrar"}</Button></div>
      <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="fin-interactive fin-pressable absolute -right-3 top-[86px] grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground" aria-label={sidebarCollapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}>{sidebarCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}</button>
    </aside>
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", desktopSidebarWidth)}>
      <header className="fixed inset-x-0 top-0 z-50 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-end border-b border-border/60 bg-background/90 px-4 pb-1 backdrop-blur-xl lg:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="grid h-14 w-full grid-cols-[44px_1fr_44px] items-center gap-2"><button type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menu" className="grid size-11 place-items-center rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur-xl active:scale-95"><Menu className="size-5" /></button><Link to="/dashboard" aria-label="Ir para o início" className="flex min-w-0 items-center justify-center"><Logo /></Link><span aria-hidden="true" className="size-11" /></div>
      </header>
      {isInternalTest && <div className="shrink-0 border-b border-border bg-fin-brand-soft px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">Ambiente de teste · acesso interno sem cobrança real</div>}
      <main className={cn("min-h-0 min-w-0 flex-1 overscroll-y-contain px-3 sm:px-5 lg:px-8", isHome ? "overflow-hidden px-0 pt-0 sm:px-0 lg:px-0" : "overflow-y-auto pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] sm:pt-[calc(3.5rem+env(safe-area-inset-top)+1.25rem)] lg:pt-7")} style={{ paddingBottom: isHome ? 0 : "max(1rem, env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}>
        <MotionPage className={cn("min-h-full mx-auto max-w-7xl", isHome && "h-full max-w-none")}>{children}</MotionPage>
      </main>
    </div>
    {drawerOpen && <MobileDrawer activePathname={activePathname} onClose={() => setDrawerOpen(false)} />}
    {!visualReview && <Suspense fallback={null}><TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} /></Suspense>}
  </div>;
}
