import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/finanzzi/Logo";

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
    <div className="min-h-screen bg-[#111111] text-[#111827]">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" aria-label="Voltar para o início">
          <Logo />
        </a>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
        <section className="hidden lg:block">
          <div className="rounded-[2rem] border border-[#E1E7E3] bg-[#181818] p-8 text-[#111827] shadow-[0_18px_55px_rgba(21,24,39,.08)]">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FF5A1F] text-[10px] font-black uppercase tracking-[0.16em] text-[#111827]">
                FIN
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#181818]">
                  Tudo certo
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
                  Seu acesso continua seguro.
                </h2>
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-[#E1E7E3] bg-white p-4">
              <p className="text-sm text-[#556070]">
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#181818] px-3 py-1.5 text-xs font-bold text-[#FF5A1F]">
              <KeyRound className="size-3.5" /> Recuperar acesso
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Criar nova senha
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#556070]">
              Escolha uma nova senha para continuar acessando sua conta.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-[#E1E7E3] bg-white p-5 shadow-[0_18px_55px_rgba(21,24,39,.08)] sm:p-7"
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
                className="h-12 rounded-xl border-[#E1E7E3] bg-[#111111] text-[#111827] placeholder:text-[#556070] focus:border-[#FF5A1F] focus:ring-[#FF5A1F]"
                required
              />
            </div>
            <Button
              type="submit"
              className="mt-6 h-12 w-full rounded-xl bg-[#FF5A1F] font-bold text-[#111827] hover:bg-[#FF5A1F]"
              disabled={busy}
            >
              {busy ? "Salvando..." : "Salvar nova senha"}
              <ArrowRight className="ml-auto size-4" />
            </Button>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#556070]">
              <ShieldCheck className="size-4 text-[#FF5A1F]" /> Você poderá voltar ao app com
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
