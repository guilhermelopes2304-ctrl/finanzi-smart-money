import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

type Mode = "login" | "signup" | "recover";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } => {
    const mode = search["mode"];
    return mode === "signup" || mode === "recover" || mode === "login" ? { mode } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — FINANZZI" },
      {
        name: "description",
        content: "Acesse sua conta FINANZZI e continue organizando sua vida financeira.",
      },
      { property: "og:title", content: "Entrar ou criar conta — FINANZZI" },
      { property: "og:description", content: "Acesse sua conta FINANZZI." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Vamos organizar sua vida financeira.");
        await navigate({ to: "/dashboard" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        await navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      toast.error(translate(message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end px-4 pt-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link to="/" className="mx-auto mb-6">
          <Logo />
        </Link>
        <div className="surface-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">
            {mode === "signup"
              ? "Criar sua conta"
              : mode === "login"
                ? "Entrar no FINANZZI"
                : "Recuperar senha"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Comece gratuitamente a organizar seu dinheiro."
              : mode === "login"
                ? "Que bom te ver de novo."
                : "Informe seu e-mail e enviaremos um link para criar uma nova senha."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>
            {mode !== "recover" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  placeholder="Mínimo de 6 caracteres"
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Aguarde..."
                : mode === "signup"
                  ? "Criar conta"
                  : mode === "login"
                    ? "Entrar"
                    : "Enviar link de recuperação"}
            </Button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode("recover")}
                >
                  Esqueci minha senha
                </button>
                <p className="text-muted-foreground">
                  Ainda não tem conta?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Criar gratuitamente
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-muted-foreground">
                Já tem conta?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("login")}
                >
                  Entrar
                </button>
              </p>
            )}
            {mode === "recover" && (
              <button
                type="button"
                className="text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode("login")}
              >
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function translate(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "User already registered": "Este e-mail já possui uma conta. Tente entrar.",
    "Password should be at least 6 characters.": "A senha precisa ter pelo menos 6 caracteres.",
  };
  return map[message] ?? message;
}