import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useCategories,
  useDeleteRow,
  useProfile,
  useSaveRow,
  useUpdateProfile,
} from "@/hooks/useFinanceData";
import { parseBRL } from "@/lib/format";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { ConfirmDelete } from "@/components/finanzzi/ConfirmDelete";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — FINANZZI" },
      { name: "description", content: "Gerencie seu perfil, senha e categorias personalizadas." },
      { property: "og:title", content: "Configurações — FINANZZI" },
      { property: "og:description", content: "Sua conta FINANZZI do seu jeito." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setIncome(String(Number(profile.monthly_income).toFixed(2)).replace(".", ","));
    }
  }, [profile]);

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Não foi possível alterar a senha", { description: error.message });
      return;
    }
    setPassword("");
    toast.success("Senha alterada com sucesso");
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Sua conta e suas preferências." />

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="surface-card space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ name, monthly_income: parseBRL(income) });
          }}
        >
          <h2 className="text-base font-semibold">Minha conta</h2>
          <div className="space-y-1.5">
            <Label htmlFor="set-name">Nome</Label>
            <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-email">E-mail</Label>
            <Input id="set-email" value={profile?.email ?? ""} readOnly disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-income">Renda mensal</Label>
            <MoneyInput id="set-income" value={income} onChange={setIncome} />
          </div>
          <Button type="submit" disabled={update.isPending}>
            Salvar alterações
          </Button>
        </form>

        <form className="surface-card space-y-4 p-5" onSubmit={changePassword}>
          <h2 className="text-base font-semibold">Segurança</h2>
          <div className="space-y-1.5">
            <Label htmlFor="set-pass">Nova senha</Label>
            <Input
              id="set-pass"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="outline">
            Alterar senha
          </Button>
          <div className="border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                await navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" /> Sair da conta
            </Button>
          </div>
        </form>
      </div>

      <CategoriesSection />
    </div>
  );
}

function CategoriesSection() {
  const { data: categories = [] } = useCategories();
  const save = useSaveRow<Record<string, unknown>>("categories", { successMessage: "Categoria salva" });
  const remove = useDeleteRow("categories", "Categoria excluída");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("expense");

  return (
    <div className="surface-card mt-4 p-5">
      <h2 className="text-base font-semibold">Minhas categorias</h2>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          save.mutate(
            { values: { name: name.trim(), kind, color: "#16a34a", is_default: false } },
            { onSuccess: () => setName("") },
          );
        }}
      >
        <Input
          className="w-52"
          placeholder="Nova categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">
          <Plus className="size-4" /> Adicionar
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
            <ConfirmDelete
              title="Excluir categoria?"
              description="Os lançamentos ficarão sem categoria."
              onConfirm={() => remove.mutate(c.id)}
              trigger={
                <button type="button" aria-label={`Excluir ${c.name}`}>
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-danger" />
                </button>
              }
            />
          </span>
        ))}
      </div>
    </div>
  );
}