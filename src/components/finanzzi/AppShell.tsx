import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Brain, CalendarClock, CreditCard, Home, LogOut, MessageCircle, MoreHorizontal, Plus, Settings, ShoppingBag, Target, Wallet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import { FinancialAssistant } from "@/components/finanzzi/FinancialAssistant";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/lancamentos", label: "Lançamentos", icon: Wallet },
  { to: "/contas", label: "Contas", icon: CalendarClock },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/inteligencia", label: "Inteligência", icon: Brain },
  { to: "/posso-comprar", label: "Posso comprar?", icon: ShoppingBag },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function openAssistant() { window.dispatchEvent(new CustomEvent("finanzzi:open-assistant")); }

function NavItem({ item, active, onNavigate }: { item: (typeof NAV)[number]; active: boolean; onNavigate?: () => void }) {
  return <Link to={item.to} onClick={onNavigate} className={cn("flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[11px] font-semibold transition-colors active:scale-[0.98]", active ? "text-primary" : "text-muted-foreground")}><item.icon className="size-5" strokeWidth={active ? 2.4 : 2} /><span className="max-w-[78px] truncate">{item.label === "Dashboard" ? "Início" : item.label}</span></Link>;
}

function initials(name?: string | null) {
  if (!name) return "F";
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas") void navigate({ to: "/boas-vindas" });
  }, [profile, isLoading, pathname, navigate]);
  useEffect(() => setMoreOpen(false), [pathname]);

  async function signOut() { await supabase.auth.signOut(); await navigate({ to: "/" }); }
  if (pathname === "/boas-vindas") return <>{children}</>;

  const firstName = profile?.name?.trim().split(/\s+/)[0] || "você";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center justify-between px-5 py-5"><Logo /><ThemeToggle /></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">{NAV.map((item) => { const active = pathname === item.to; return <Link key={item.to} to={item.to} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}><item.icon className="size-4" />{item.label}</Link>; })}</nav>
        <div className="space-y-3 p-4"><Button className="h-11 w-full" onClick={() => setTransactionOpen(true)}><Plus className="size-4" /> Novo lançamento</Button><button onClick={signOut} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><LogOut className="size-4" /> Sair</button></div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div className="min-w-0"><p className="truncate text-base font-bold tracking-tight">Olá, {firstName} 👋</p><p className="text-[11px] text-muted-foreground">Seu dinheiro, de um jeito simples.</p></div>
          <div className="flex shrink-0 items-center gap-2"><ThemeToggle /><Link to="/configuracoes" aria-label="Abrir configurações" className="grid size-10 place-items-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary shadow-sm transition-transform active:scale-95">{initials(profile?.name)}</Link></div>
        </div>
      </header>

      <main className="min-w-0 px-3 pt-4 pb-32 sm:px-5 lg:ml-64 lg:px-8 lg:pt-8 lg:pb-10"><div className="mx-auto min-w-0 max-w-6xl">{children}</div></main>

      <nav className="fixed inset-x-2 bottom-2 z-30 rounded-[1.35rem] border border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 items-end px-1">
          <NavItem item={NAV[0]} active={pathname === NAV[0].to} />
          <NavItem item={NAV[1]} active={pathname === NAV[1].to} />
          <div className="flex min-h-14 justify-center"><button type="button" onClick={() => setTransactionOpen(true)} aria-label="Novo lançamento" className="gradient-brand -mt-7 grid size-14 place-items-center rounded-full border-4 border-background text-white shadow-[var(--shadow-lift)] transition-transform active:scale-95"><Plus className="size-6" strokeWidth={2.7} /></button></div>
          <button type="button" onClick={openAssistant} className="flex min-h-14 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors active:scale-[0.98] active:text-primary"><MessageCircle className="size-5" /><span>Fin</span></button>
          <button type="button" onClick={() => setMoreOpen(true)} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors active:scale-[0.98]", moreOpen ? "text-primary" : "text-muted-foreground")}><MoreHorizontal className="size-5" /><span>Mais</span></button>
        </div>
      </nav>

      {moreOpen && <div className="fixed inset-0 z-40 lg:hidden"><button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setMoreOpen(false)} /><section className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-border bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/25" /><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Assistente financeiro</p><h2 className="text-lg font-bold">Mais opções</h2></div><button type="button" onClick={() => setMoreOpen(false)} className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Fechar"><X className="size-5" /></button></div><div className="grid grid-cols-3 gap-2">{NAV.slice(2).map((item) => <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={cn("flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-2 text-center text-xs font-semibold transition-all active:scale-95", pathname === item.to ? "border-primary bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}><item.icon className="size-5" />{item.label}</Link>)}</div><button type="button" onClick={signOut} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground"><LogOut className="size-4" /> Encerrar sessão</button></section></div>}

      <TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} />
      <FinancialAssistant />
    </div>
  );
}
