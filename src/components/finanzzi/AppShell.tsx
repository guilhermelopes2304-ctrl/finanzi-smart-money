import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Brain,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Settings,
  ShoppingBag,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import { FinancialAssistant } from "@/components/finanzzi/FinancialAssistantV2";
import { NavigationLoading } from "@/components/finanzzi/NavigationLoading";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/lancamentos", label: "Lançar", icon: Wallet },
  { to: "/contas", label: "Compromissos", icon: CalendarClock },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/metas", label: "Objetivos", icon: Target },
  { to: "/relatorios", label: "Finanças", icon: BarChart3 },
  { to: "/inteligencia", label: "Fin", icon: Brain },
  { to: "/posso-comprar", label: "Posso gastar", icon: ShoppingBag },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

const NAV_GROUPS = [
  { title: "Visão geral", items: [NAV[0]] },
  { title: "Dinheiro", items: [NAV[1], NAV[2], NAV[3], NAV[7]] },
  { title: "Planejamento", items: [NAV[4], NAV[5]] },
  { title: "Inteligência", items: [NAV[6]] },
  { title: "Sistema", items: [NAV[8]] },
] as const;

function openAssistant() {
  window.dispatchEvent(new CustomEvent("finanzzi:open-assistant"));
}
function beginNavigation() {
  window.dispatchEvent(new CustomEvent("finanzzi:navigation-start"));
}
function initials(name?: string | null) {
  if (!name) return "F";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function NavItem({
  item,
  active,
  onNavigate,
  mobile = false,
  collapsed = false,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
  collapsed?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        to={item.to}
        onClick={() => {
          beginNavigation();
          onNavigate?.();
        }}
        className={cn(
          "group flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-all duration-200 active:scale-[0.96]",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl transition-all",
            active ? "bg-primary text-primary-foreground shadow-sm" : "group-hover:bg-background",
          )}
        >
          <item.icon className="size-[18px]" strokeWidth={active ? 2.3 : 1.9} />
        </span>
        <span className="max-w-[78px] truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={item.to}
      onClick={beginNavigation}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex min-h-11 items-center rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-muted-foreground group-hover:bg-background group-hover:text-foreground",
        )}
      >
        <item.icon className="size-4" strokeWidth={active ? 2.2 : 1.9} />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile, isLoading, isPro, isInternalTest } = usePlan();
  const navigate = useNavigate();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("finanzzi:navigation-end"));
  }, [pathname]);
  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas")
      void navigate({ to: "/boas-vindas" });
  }, [profile, isLoading, pathname, navigate]);
  useEffect(() => setMoreOpen(false), [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  if (pathname === "/boas-vindas") return <>{children}</>;

  const desktopSidebarWidth = sidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[256px]";
  const desktopBannerPadding = sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[256px]";

  return (
    <div
      data-fin-app-shell
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      <NavigationLoading />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card lg:flex",
          "transition-[width] duration-300 ease-out",
          sidebarCollapsed ? "w-[88px]" : "w-[256px]",
        )}
      >
        <div
          className={cn(
            "flex h-[78px] items-center border-b border-border",
            sidebarCollapsed ? "justify-center px-3" : "justify-between px-5",
          )}
        >
          <Link to="/dashboard" aria-label="FINANZZI">
            {sidebarCollapsed ? (
              <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background font-display text-sm font-bold shadow-sm">
                F
              </span>
            ) : (
              <Logo />
            )}
          </Link>
          {!sidebarCollapsed && <ThemeToggle />}
        </div>

        <div className={cn("border-b border-border", sidebarCollapsed ? "px-3 py-4" : "px-5 py-4")}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.08em] text-primary">
                {isInternalTest ? "T" : isPro ? "P" : "F"}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  Seu dinheiro
                </p>
                <Link
                  to="/configuracoes"
                  className="rounded-full bg-muted px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {isInternalTest ? "Teste interno" : isPro ? "Acesso ativo" : "Acesso pago"}
                </Link>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Minha situação. Minha próxima decisão.
              </p>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.to}
                    item={item}
                    active={pathname === item.to}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Button
            className={cn(
              "h-11 rounded-xl shadow-sm transition-transform active:scale-[0.98]",
              sidebarCollapsed ? "w-11 justify-center px-0" : "w-full",
            )}
            onClick={() => setTransactionOpen(true)}
            title={sidebarCollapsed ? "Lançar agora" : undefined}
          >
            <Plus className="size-4" />
            {!sidebarCollapsed && "Lançar agora"}
          </Button>
          {!sidebarCollapsed && (
            <button
              onClick={signOut}
              className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" /> Sair
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((value) => !value)}
          className="absolute -right-3 top-[86px] grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          aria-label={sidebarCollapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}
          title={sidebarCollapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/configuracoes"
              aria-label="Abrir configurações"
              className="grid size-10 place-items-center rounded-full border border-border bg-card text-xs font-bold text-primary shadow-sm transition-all active:scale-95"
            >
              {initials(profile?.name)}
            </Link>
          </div>
        </div>
      </header>

      {isInternalTest && (
        <div
          className={cn(
            "border-b border-foreground/10 bg-foreground px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-primary",
            desktopBannerPadding,
          )}
        >
          Ambiente de teste · acesso interno sem cobrança real
        </div>
      )}

      <main
        className={cn(
          "min-w-0 px-3 pb-32 pt-4 sm:px-5 lg:px-8 lg:pb-10 lg:pt-8",
          desktopSidebarWidth,
        )}
      >
        <div className="mx-auto min-w-0 max-w-7xl">{children}</div>
      </main>

      <nav className="fixed inset-x-2 bottom-2 z-30 rounded-[1.4rem] border border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_10px_35px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="grid grid-cols-5 items-end px-1.5 py-1">
          <NavItem item={NAV[0]} active={pathname === NAV[0].to} mobile />
          <NavItem item={NAV[1]} active={pathname === NAV[1].to} mobile />
          <NavItem item={NAV[2]} active={pathname === NAV[2].to} mobile />
          <button
            type="button"
            onClick={openAssistant}
            className="group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold text-muted-foreground transition-all active:scale-[0.96] active:text-primary"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <MessageCircle className="size-[18px]" />
            </span>
            <span>Fin</span>
          </button>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-all active:scale-[0.96]",
              moreOpen ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="grid size-9 place-items-center rounded-xl group-hover:bg-muted/70">
              <MoreHorizontal className="size-[18px]" />
            </span>
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/35 backdrop-blur-[3px]"
            onClick={() => setMoreOpen(false)}
          />
          <section className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl animate-fin-fade-up">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/25" />
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  FINANZZI
                </p>
                <h2 className="mt-1 text-xl font-semibold">Mais opções</h2>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.slice(3).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    beginNavigation();
                    setMoreOpen(false);
                  }}
                  className={cn(
                    "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-2 text-center text-xs font-semibold transition-all active:scale-95",
                    pathname === item.to
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-muted/70">
                    <item.icon className="size-5" />
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" /> Encerrar sessão
            </button>
          </section>
        </div>
      )}

      <TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} />
      <FinancialAssistant />
    </div>
  );
}
