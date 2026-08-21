import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinMascot } from "@/components/finanzzi/FinMascot";
import { Logo } from "@/components/finanzzi/Logo";
import { ThemeToggle } from "@/components/finanzzi/ThemeToggle";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar nova senha — FINANZZI" },
      { name: "description", content: "Defina uma nova senha para acessar sua conta FINANZZI." },
      { property: "og:title", content: "Criar nova senha — FINANZZI" },
      { property: "og:description", content: "Defina uma nova senha para sua conta FINANZZI." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível alterar a senha", { description: translate(error.message) });
      return;
    }
    toast.success("Senha atualizada com sucesso!");
    await navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#151827] dark:bg-[#151827] dark:text-[#FCFBF7]">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" aria-label="Voltar para o início">
          <Logo />
        </a>
        <ThemeToggle />
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
        <section className="hidden lg:block">
          <div className="rounded-[2rem] bg-[#151827] p-8 text-[#FCFBF7] shadow-[0_20px_60px_rgba(21,24,39,.2)]">
            <div className="flex items-center gap-4">
              <FinMascot expression="calmo" className="h-24 w-24 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#EEF0FF]">
                  Tudo certo
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
                  Seu acesso continua seguro.
                </h2>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-[#667085]/70 bg-[#3F4658]/70 p-4">
              <p className="text-sm text-[#F4F5F8]">
                Depois de criar sua senha, você volta direto para o FINANZZI.
              </p>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo className="mx-auto" />
          </div>
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EEF0FF] px-3 py-1.5 text-xs font-bold text-[#4546C8] dark:bg-[#3F4658] dark:text-[#EEF0FF]">
              <KeyRound className="size-3.5" /> Recuperar acesso
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Criar nova senha
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#3F4658] dark:text-[#F4F5F8]">
              Escolha uma nova senha para continuar acessando sua conta.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-[#E4E7EF] bg-white p-5 shadow-[0_18px_55px_rgba(21,24,39,.08)] dark:border-[#667085] dark:bg-[#3F4658] sm:p-7"
          >
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="h-12 rounded-xl border-[#E4E7EF] bg-[#FCFBF7] text-[#151827] placeholder:text-[#667085] focus:border-[#5B5CE2] focus:ring-[#5B5CE2] dark:border-[#667085] dark:bg-[#151827] dark:text-[#FCFBF7] dark:placeholder:text-[#F4F5F8]"
                required
              />
            </div>
            <Button
              type="submit"
              className="mt-6 h-12 w-full rounded-xl bg-[#5B5CE2] font-bold text-[#FCFBF7] hover:bg-[#4546C8]"
              disabled={busy}
            >
              {busy ? "Salvando..." : "Salvar nova senha"}
              <ArrowRight className="ml-auto size-4" />
            </Button>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#667085] dark:text-[#F4F5F8]">
              <ShieldCheck className="size-4 text-[#5B5CE2]" /> Você poderá voltar ao app com
              segurança.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

function translate(message: string): string {
  if (message === "New password should be different from the old password.") {
    return "A nova senha precisa ser diferente da senha atual.";
  }
  if (message === "Password should be at least 6 characters.") {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return "Tente novamente em instantes.";
}
