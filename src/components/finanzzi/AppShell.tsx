import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  MoreHorizontal,
  Plus,
  Settings,
  ShoppingBag,
  Target,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { MotionPage } from "@/components/finanzzi/MotionPage";

const TransactionDialog = lazy(() =>
  import("@/components/finanzzi/TransactionDialog").then((module) => ({
    default: module.TransactionDialog,
  })),
);
import { NavigationLoading } from "@/components/finanzzi/NavigationLoading";
import { cn } from "@/lib/utils";

export type NavItemDefinition = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const NAV: readonly NavItemDefinition[] = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/lancamentos", label: "Histórico", icon: Wallet },
  { to: "/contas", label: "Contas", icon: CalendarClock },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/metas", label: "Metas", icon: Target },
];
const MOBILE_NAV: readonly [NavItemDefinition, NavItemDefinition, NavItemDefinition] = [
  NAV[0] as NavItemDefinition,
  NAV[1] as NavItemDefinition,
  NAV[2] as NavItemDefinition,
];

const MORE_NAV: readonly NavItemDefinition[] = [
  { to: "/relatorios", label: "Resumo", icon: BarChart3 },
  { to: "/posso-comprar", label: "Posso gastar", icon: ShoppingBag },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

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
  mobile = false,
  collapsed = false,
  onNavigate,
}: {
  item: NavItemDefinition;
  active: boolean;
  mobile?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
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
          "group flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-colors active:scale-[0.97]",
          active
            ? "bg-fin-brand-soft text-fin-brand-hover"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl transition-colors",
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
      onClick={() => {
        beginNavigation();
        onNavigate?.();
      }}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex min-h-11 items-center rounded-xl py-2.5 text-sm font-semibold transition-colors",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        active
          ? "bg-fin-brand-soft text-fin-brand-hover"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground",
        )}
      >
        <item.icon className="size-4" strokeWidth={active ? 2.2 : 1.9} />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function MoreMenu({
  activePathname,
  mobile = false,
  onClose,
}: {
  activePathname: string;
  mobile?: boolean;
  onClose?: () => void;
}) {
  if (mobile) {
    return (
      <section className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl animate-fin-fade-up">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/25" />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover">
              FINANZZI
            </p>
            <h2 className="mt-1 text-xl font-semibold">Mais opções</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MORE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                beginNavigation();
                onClose?.();
              }}
              className={cn(
                "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-2 text-center text-xs font-semibold transition-colors active:scale-[0.97]",
                activePathname === item.to
                  ? "border-primary bg-fin-brand-soft text-fin-brand-hover"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-muted">
                <item.icon className="size-5" />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="absolute inset-x-3 bottom-24 z-10 rounded-2xl border border-border bg-card p-2 shadow-soft">
      {MORE_NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => {
            beginNavigation();
            onClose?.();
          }}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
            activePathname === item.to
              ? "bg-fin-brand-soft text-fin-brand-hover"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function AppShell({
  children,
  visualReview = false,
}: {
  children: ReactNode;
  visualReview?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activePathname =
    visualReview && pathname === "/visual-review/dashboard" ? "/dashboard" : pathname;
  const { data: profile, isLoading, isPro, isInternalTest } = usePlan();
  const navigate = useNavigate();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const moreActive = MORE_NAV.some((item) => item.to === activePathname);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("finanzzi:navigation-end", { detail: pathname }));
  }, [pathname]);
  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas")
      void navigate({ to: "/boas-vindas" });
  }, [profile, isLoading, pathname, navigate]);
  useEffect(() => {
    if (pathname) setMoreOpen(false);
  }, [pathname]);

  if (pathname === "/boas-vindas") return children;

  const desktopSidebarWidth = sidebarCollapsed ? "lg:ml-[88px]" : "lg:ml-[256px]";
  const desktopBannerPadding = sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[256px]";

  return (
    <div data-fin-app-shell className="min-h-screen bg-background text-foreground">
      <NavigationLoading />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card lg:flex",
          "transition-[width] duration-200 ease-out",
          sidebarCollapsed ? "w-[88px]" : "w-[256px]",
        )}
      >
        <div
          className={cn(
            "flex h-[78px] items-center border-b border-border",
            sidebarCollapsed ? "justify-center px-3" : "px-5",
          )}
        >
          <Link to="/dashboard" aria-label="FINANZZI">
            {sidebarCollapsed ? <Logo compact /> : <Logo />}
          </Link>
        </div>

        <div className={cn("border-b border-border", sidebarCollapsed ? "px-3 py-4" : "px-5 py-4")}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <span className="grid size-9 place-items-center rounded-full bg-fin-brand-soft text-[10px] font-black uppercase tracking-[0.08em] text-fin-brand-hover">
                {isInternalTest ? "T" : isPro ? "P" : "F"}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fin-brand-hover">
                  FINANZZI
                </p>
                <Link
                  to="/configuracoes"
                  className="rounded-full bg-fin-brand-soft px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-fin-brand-hover hover:bg-primary hover:text-primary-foreground"
                >
                  {isInternalTest ? "Teste interno" : isPro ? "Acesso ativo" : "Acesso pago"}
                </Link>
              </div>
            </>
          )}
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {NAV.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                active={activePathname === item.to}
                collapsed={sidebarCollapsed}
              />
            ))}
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              title={sidebarCollapsed ? "Mais" : undefined}
              aria-expanded={moreOpen}
              className={cn(
                "group flex min-h-11 w-full items-center rounded-xl py-2.5 text-sm font-semibold transition-colors",
                sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                moreActive || moreOpen
                  ? "bg-fin-brand-soft text-fin-brand-hover"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  moreActive || moreOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground",
                )}
              >
                <MoreHorizontal className="size-4" />
              </span>
              {!sidebarCollapsed && <span>Mais</span>}
            </button>
          </div>
          {moreOpen && (
            <MoreMenu activePathname={activePathname} onClose={() => setMoreOpen(false)} />
          )}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Button
            className={cn(
              "h-11 rounded-xl shadow-sm transition-transform active:scale-[0.98]",
              sidebarCollapsed ? "w-11 justify-center px-0" : "w-full",
            )}
            onClick={() => {
              if (!visualReview) setTransactionOpen(true);
            }}
            title={sidebarCollapsed ? "Registrar" : undefined}
          >
            <Plus className="size-4" />
            {!sidebarCollapsed && "Registrar"}
          </Button>
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

      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-2.5 lg:hidden">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Logo />
          <Link
            to="/configuracoes"
            aria-label="Abrir configurações"
            className="grid size-10 overflow-hidden place-items-center rounded-full border border-border bg-card text-xs font-bold text-fin-brand-hover shadow-sm transition-transform active:scale-95"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              initials(profile?.name)
            )}
          </Link>
        </div>
      </header>

      {isInternalTest && (
        <div
          className={cn(
            "border-b border-border bg-fin-brand-soft px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-fin-brand-hover",
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
        <MotionPage className="mx-auto max-w-7xl">{children}</MotionPage>
      </main>

      <nav className="fixed inset-x-2 bottom-2 z-30 rounded-[1.4rem] border border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-soft lg:hidden">
        <div className="grid grid-cols-5 items-end px-1.5 py-1">
          <NavItem item={MOBILE_NAV[0]} active={activePathname === MOBILE_NAV[0].to} mobile />
          <NavItem item={MOBILE_NAV[1]} active={activePathname === MOBILE_NAV[1].to} mobile />
          <NavItem item={MOBILE_NAV[2]} active={activePathname === MOBILE_NAV[2].to} mobile />
          <NavItem
            item={{ to: "/metas", label: "Metas", icon: Target }}
            active={activePathname === "/metas"}
            mobile
          />
          <button
            type="button"
            onClick={() => {
              if (!visualReview) setMoreOpen(true);
            }}
            className={cn(
              "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors active:scale-[0.97]",
              moreOpen || moreActive
                ? "bg-fin-brand-soft text-fin-brand-hover"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-expanded={moreOpen}
          >
            <span className="grid size-9 place-items-center rounded-xl group-hover:bg-muted">
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
            className="absolute inset-0 bg-[#111827]/25"
            onClick={() => setMoreOpen(false)}
          />
          <MoreMenu activePathname={activePathname} mobile onClose={() => setMoreOpen(false)} />
        </div>
      )}

      {!visualReview && (
        <Suspense fallback={null}>
          <TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} />
        </Suspense>
      )}
    </div>
  );
}
