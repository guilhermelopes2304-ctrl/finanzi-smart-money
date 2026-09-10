import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, List, Plus, Settings, Sparkles, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { MotionPage } from "@/components/finanzzi/MotionPage";
import { NavigationLoading } from "@/components/finanzzi/NavigationLoading";
import { cn } from "@/lib/utils";

const TransactionDialog = lazy(() => import("@/components/finanzzi/TransactionDialog").then((module) => ({ default: module.TransactionDialog })));

type NavItem = { to: string; label: string; icon: LucideIcon };
const PRIMARY_NAV: readonly NavItem[] = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/lancamentos", label: "Lançamentos", icon: List },
  { to: "/inteligencia", label: "Inteligência", icon: Sparkles },
  { to: "/configuracoes", label: "Perfil", icon: Settings },
];
const SECONDARY_NAV: readonly NavItem[] = [
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/cartoes", label: "Cartões", icon: Wallet },
  { to: "/metas", label: "Metas", icon: Wallet },
  { to: "/relatorios", label: "Resumo", icon: List },
];
function beginNavigation() { window.dispatchEvent(new CustomEvent("finanzzi:navigation-start")); }
function NavigationLink({ item, active, compact = false }: { item: NavItem; active: boolean; compact?: boolean }) {
  return <Link to={item.to} onClick={() => { if (!active) beginNavigation(); }} aria-current={active ? "page" : undefined} className={cn("fin-interactive fin-pressable flex items-center rounded-2xl text-sm font-semibold transition-colors", compact ? "justify-center px-2 py-2" : "gap-3 px-3 py-3", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/[.045] hover:text-foreground")}>
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(255,77,0,.22)]" : "bg-white/[.045]")}><item.icon className="size-[17px]" strokeWidth={active ? 2.2 : 1.9} /></span>
    {!compact && <span className="truncate">{item.label}</span>}
  </Link>;
}
function MobileTabBar({ activePathname, onAdd }: { activePathname: string; onAdd: () => void }) {
  return <nav className="fin-mobile-tabbar fixed inset-x-3 bottom-2 z-[70] grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-end gap-1 rounded-[24px] px-2 pt-1 lg:hidden" aria-label="Navegação principal">
    {PRIMARY_NAV.slice(0, 2).map((item) => <NavigationLink key={item.to} item={item} active={activePathname === item.to} compact />)}
    <button type="button" onClick={onAdd} aria-label="Registrar lançamento" className="fin-mobile-add -mt-7 grid size-14 shrink-0 place-items-center rounded-full text-white shadow-[0_12px_32px_rgba(255,77,0,.34)] transition-transform active:scale-95"><Plus className="size-6" strokeWidth={2.5} /></button>
    {PRIMARY_NAV.slice(2).map((item) => <NavigationLink key={item.to} item={item} active={activePathname === item.to} compact />)}
  </nav>;
}
export function AppShellV2({ children, visualReview = false }: { children: ReactNode; visualReview?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activePathname = visualReview && pathname === "/visual-review/dashboard" ? "/dashboard" : pathname;
  const { data: profile, isLoading, isInternalTest } = usePlan();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { window.dispatchEvent(new CustomEvent("finanzzi:navigation-end", { detail: pathname })); }, [pathname]);
  useEffect(() => { if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas") void navigate({ to: "/boas-vindas" }); }, [profile, isLoading, pathname, navigate]);
  if (pathname === "/boas-vindas") return children;
  const isHome = activePathname === "/dashboard";
  return <div data-fin-app-shell className="flex min-h-[100dvh] w-full overflow-hidden bg-background text-foreground">
    <NavigationLoading />
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-white/[.07] bg-[#0d0d0d]/96 px-3 py-4 backdrop-blur-2xl lg:flex">
      <Link to="/dashboard" className="flex h-14 items-center px-3" aria-label="FINANZZI"><Logo /></Link>
      <nav className="mt-5 space-y-1" aria-label="Navegação">{PRIMARY_NAV.map((item) => <NavigationLink key={item.to} item={item} active={activePathname === item.to} />)}</nav>
      <div className="my-5 border-t border-white/[.07]" /><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Seu dinheiro</p>
      <nav className="space-y-1">{SECONDARY_NAV.map((item) => <NavigationLink key={item.to} item={item} active={activePathname === item.to} />)}</nav>
      <div className="mt-auto p-1"><Button className="h-12 w-full rounded-2xl shadow-[0_8px_28px_rgba(255,77,0,.18)]" onClick={() => !visualReview && setTransactionOpen(true)}><Plus className="size-4" /> Registrar</Button></div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col lg:ml-[236px]">
      <header className="sticky top-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-end border-b border-white/[.06] bg-[#0d0d0d]/80 px-4 pb-1 backdrop-blur-2xl lg:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}><div className="flex h-14 w-full items-center justify-center"><Link to="/dashboard" aria-label="Ir para o início"><Logo /></Link></div></header>
      {isInternalTest && <div className="shrink-0 border-b border-white/[.06] bg-primary/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[.16em] text-primary">Ambiente de teste</div>}
      <main className={cn("min-h-0 min-w-0 flex-1", isHome ? "overflow-y-auto" : "overflow-y-auto px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-7")} style={{ paddingBottom: isHome ? "calc(84px + env(safe-area-inset-bottom))" : "max(1rem, env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}><MotionPage className={cn("mx-auto min-h-full max-w-7xl", isHome && "max-w-none")}>{children}</MotionPage></main>
    </div>
    {!visualReview && <MobileTabBar activePathname={activePathname} onAdd={() => setTransactionOpen(true)} />}
    {!visualReview && <Suspense fallback={null}><TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} /></Suspense>}
  </div>;
}
