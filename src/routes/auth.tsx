import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

type Mode = "login" | "recover";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode; returnTo?: string } => {
    const mode = search["mode"];
    const returnTo = typeof search["returnTo"] === "string" ? search["returnTo"] : undefined;
    return {
      ...(mode === "recover" || mode === "login" ? { mode } : {}),
      ...(returnTo?.startsWith("/") ? { returnTo } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Entrar — FINANZZI" },
      { name: "description", content: "Acesse o FINANZZI e entenda melhor o seu dinheiro." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, returnTo } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        await navigate({ to: returnTo === "/oferta" ? "/oferta" : "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("login");
      }
    } catch (error) {
      toast.error(translate(error instanceof Error ? error.message : "Tente novamente."));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Que bom ter você de volta" : "Vamos recuperar seu acesso";
  const subtitle =
    mode === "login"
      ? "Entre para acessar o FINANZZI completo após a aprovação da sua assinatura."
      : "Digite seu e-mail e enviaremos um link seguro para redefinir sua senha.";

  return (
    <div className="min-h-screen overflow-hidden bg-background lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <aside className="relative hidden overflow-hidden bg-[#071a12] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="fin-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-emerald-300/10 blur-3xl animate-float-slower" />
        <div className="absolute -bottom-28 right-0 size-96 rounded-full bg-primary/25 blur-3xl animate-float-slow" />
        <div className="relative p-10 xl:p-14">
          <Link to="/" className="animate-fin-fade-up">
            <Logo />
          </Link>
          <div className="mt-28 max-w-lg animate-fin-fade-up" style={{ animationDelay: "100ms" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-emerald-200 backdrop-blur">
              <Sparkles className="size-3.5" /> Inteligência para o seu dinheiro
            </span>
            <h2 className="mt-6 max-w-md font-display text-4xl font-semibold leading-tight xl:text-5xl">
              O seu dinheiro merece uma conversa melhor.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-white/65">
              O FINANZZI organiza o que aconteceu, explica o que importa e ajuda você a decidir o
              que vem depois.
            </p>
            <div className="mt-9 space-y-3 text-sm text-white/75">
              {[
                "Uma visão simples da sua vida financeira",
                "Fin para ajudar nas decisões do dia a dia",
                "Experiência pensada para celular e desktop",
              ].map((text, index) => (
                <div
                  key={text}
                  className="flex items-center gap-2 animate-fin-fade-up"
                  style={{ animationDelay: `${180 + index * 70}ms` }}
                >
                  <span className="grid size-6 place-items-center rounded-full bg-white/10 text-emerald-200">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative p-10 xl:p-14">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl animate-fin-scale-in">
            <p className="text-xs text-white/45">Seu próximo passo</p>
            <p className="mt-1 font-display text-lg font-semibold">
              Ver seu dinheiro com mais clareza.
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-emerald-300 animate-fin-pulse" />
            </div>
          </div>
          <p className="mt-5 text-xs text-white/40">FINANZZI — inteligência para o seu dinheiro.</p>
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-primary/8 blur-3xl animate-float-slow" />
        <div className="relative flex items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            aria-label="Voltar para o início"
            className="grid size-11 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-soft backdrop-blur transition-all hover:-translate-x-0.5 hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <ThemeToggle />
        </div>
        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:px-6">
          <Link to="/" className="mx-auto mb-7 animate-fin-fade-up lg:hidden">
            <Logo />
          </Link>
          <div className="mb-7 animate-fin-fade-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
              <LockKeyhole className="size-3.5" /> Acesso seguro
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          <div
            className="surface-card animate-fin-scale-in p-5 shadow-lift sm:p-7"
            style={{ animationDelay: "100ms" }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                  className="h-12 rounded-xl bg-background/70 transition-all focus:bg-background"
                  required
                />
              </div>
              {mode !== "recover" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary transition-opacity hover:opacity-75"
                        onClick={() => setMode("recover")}
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={6}
                      placeholder="Mínimo de 6 caracteres"
                      className="h-12 rounded-xl bg-background/70 pr-12 transition-all focus:bg-background"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-base shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                disabled={busy}
              >
                {busy
                  ? "Aguarde..."
                  : mode === "login"
                    ? "Entrar no FINANZZI"
                    : "Enviar link de recuperação"}
                <ArrowRight className="ml-auto size-4" />
              </Button>
            </form>
            <div className="mt-5 flex items-center justify-center gap-1 text-sm">
              {mode === "login" && (
                <>
                  <span className="text-muted-foreground">Ainda não tem acesso?</span>
                  <Link
                    to="/oferta"
                    className="font-semibold text-primary transition-opacity hover:opacity-75"
                  >
                    Ver oferta
                  </Link>
                </>
              )}
              {mode === "recover" && (
                <button
                  type="button"
                  className="font-semibold text-primary transition-opacity hover:opacity-75"
                  onClick={() => setMode("login")}
                >
                  Voltar para o login
                </button>
              )}
            </div>
          </div>
          <div
            className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fin-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <ShieldCheck className="size-4 text-primary" /> Os seus dados são tratados com
            segurança.
          </div>
        </div>
      </main>
    </div>
  );
}

function translate(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos. Confira e tente de novo.",
    "User already registered":
      "Este e-mail já possui uma conta. Que tal entrar em vez de criar outra?",
    "Password should be at least 6 characters.": "A senha precisa ter pelo menos 6 caracteres.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "Email rate limit exceeded":
      "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    "Signup requires a valid password": "Digite uma senha válida para continuar.",
    "Unable to validate email address: invalid format": "Digite um e-mail em um formato válido.",
    "User not found": "Não encontramos uma conta com este e-mail.",
    "For security purposes, you can only request this after some time.":
      "Por segurança, aguarde um instante antes de tentar de novo.",
    "New password should be different from the old password.":
      "A nova senha precisa ser diferente da senha atual.",
    "Token has expired or is invalid": "Este link expirou ou já foi usado. Solicite um novo.",
    "Failed to fetch": "Sem conexão com a internet no momento. Verifique sua rede e tente de novo.",
  };
  return map[message] ?? "Algo deu errado. Tente novamente em instantes.";
}
