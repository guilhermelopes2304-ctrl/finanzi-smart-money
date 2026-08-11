import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Brain,
  CalendarClock,
  CreditCard,
  Home,
  LogOut,
  Plus,
  Settings,
  ShoppingBag,
  Target,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useFinanceData";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/finanzzi/Logo";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
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

const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[6]];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded && pathname !== "/boas-vindas") {
      void navigate({ to: "/boas-vindas" });
    }
  }, [profile, isLoading, pathname, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  if (pathname === "/boas-vindas") return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 p-4">
          <Button className="w-full" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Novo lançamento
          </Button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Novo
          </Button>
          <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="px-4 pt-5 pb-28 lg:ml-64 lg:px-8 lg:pt-8 lg:pb-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label.replace("Dashboard", "Início")}
              </Link>
            );
          })}
        </div>
      </nav>

      <TransactionDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}