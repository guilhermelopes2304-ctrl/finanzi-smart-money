import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
      toast.error("Não foi possível alterar a senha", { description: error.message });
      return;
    }
    toast.success("Senha atualizada com sucesso!");
    await navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={handleSubmit} className="surface-card space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Criar nova senha</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma nova senha para continuar acessando sua conta.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}