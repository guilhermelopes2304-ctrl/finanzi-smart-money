import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Plus, Sparkles, ShieldCheck, Trash2 } from "lucide-react";
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
import { ProModal } from "@/components/finanzzi/PlanGate";
import { usePlan } from "@/hooks/usePlan";
import { trackProductEvent } from "@/lib/product-analytics";
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
  const [proOpen, setProOpen] = useState(false);
  const { plan, isPro, subscription } = usePlan();
  const billingStatus = subscription?.status ?? "free";

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

      <section className="surface-card relative mb-4 overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/8 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Acesso atual
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                FINANZZI {isPro ? "ativo" : "pendente"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPro
                  ? "Seu acesso completo está ativo após a confirmação do pagamento."
                  : "O acesso completo depende da confirmação do pagamento aprovado."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/45 px-3 py-1.5 text-xs font-semibold">
              <ShieldCheck className="size-3.5 text-primary" /> acesso{" "}
              {isPro ? "ativo" : "pendente"}
            </span>
            <span className="rounded-full border border-border bg-muted/45 px-3 py-1.5 text-xs font-semibold">
              estado {billingStatus}
            </span>
            {!isPro && (
              <Button
                type="button"
                onClick={() => {
                  trackProductEvent("pro_viewed");
                  setProOpen(true);
                }}
                className="rounded-xl"
              >
                Ver oferta de acesso
              </Button>
            )}
          </div>
        </div>
        <p className="relative mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
          O estado de acesso é lido do billing protegido. A alteração não está disponível nesta
          interface e depende de uma confirmação administrativa segura do provedor.
        </p>
      </section>
      <ProModal open={proOpen} onOpenChange={setProOpen} />

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
  const save = useSaveRow<Record<string, unknown>>("categories", {
    successMessage: "Categoria salva",
  });
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
