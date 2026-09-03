import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Loader2, LogOut, Plus, Sparkles, ShieldCheck, Trash2 } from "lucide-react";
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { isPro, subscription } = usePlan();
  const billingStatus = subscription?.status ?? "free";

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setIncome(String(Number(profile.monthly_income).toFixed(2)).replace(".", ","));
    }
  }, [profile]);

  async function handleAvatarChange(file?: File) {
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem da galeria");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 5 MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension)
        ? extension
        : "jpg";
      const path = `${profile.id}/avatar.${safeExtension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
      await update.mutateAsync({ avatar_url: `${data.publicUrl}?v=${Date.now()}` });
      toast.success("Foto de perfil atualizada");
    } catch (error) {
      toast.error("Não foi possível atualizar a foto", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

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
    <div className="fin-screen fin-settings">
      <PageHeader title="Minha conta" subtitle="Perfil, preferências e tudo que mantém o FINANZZI do seu jeito." />

      <section className="surface-card relative mb-5 overflow-hidden rounded-[28px] border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--card))_55%,hsl(var(--primary)/0.04))] p-5 shadow-[0_14px_45px_rgba(0,0,0,0.07)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/8 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Sua experiência
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Seu FINANZZI {isPro ? "está completo" : "está pronto para você"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPro
                  ? "Você está com acesso ativo e suas preferências ficam sincronizadas com a sua conta."
                  : "Você pode continuar organizando seu dinheiro enquanto personaliza sua experiência."}
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
          className="surface-card space-y-4 rounded-[28px] p-5 shadow-[0_10px_32px_rgba(0,0,0,0.04)]"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate({ name, monthly_income: parseBRL(income) });
          }}
        >
          <h2 className="text-base font-semibold">Seu perfil</h2>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/25 p-4">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-fin-brand-soft text-lg font-bold text-fin-brand-hover transition-transform active:scale-95 disabled:opacity-60"
              aria-label="Alterar foto de perfil"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                profile?.name?.slice(0, 1).toUpperCase() || "F"
              )}
              <span className="absolute inset-x-0 bottom-0 grid h-7 place-items-center bg-black/55 text-white">
                {avatarUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </span>
            </button>
            <div>
              <p className="font-semibold">Foto de perfil</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma foto diretamente da galeria do seu celular.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 rounded-xl"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUploading ? "Enviando..." : "Escolher foto"}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handleAvatarChange(event.target.files?.[0])}
              />
            </div>
          </div>
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
          <h2 className="text-base font-semibold">Senha e acesso</h2>
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
        </form>
      </div>

      <CategoriesSection />

      <footer className="mt-10 border-t border-border pt-6 pb-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Encerrar sessão</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Você poderá entrar novamente quando quiser.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={async () => {
              await supabase.auth.signOut();
              await navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sair da conta
          </Button>
        </div>
      </footer>
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
    <div className="surface-card mt-5 rounded-[28px] p-5 shadow-[0_10px_32px_rgba(0,0,0,0.04)]">
      <h2 className="text-base font-semibold">Minhas categorias</h2>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          save.mutate(
            { values: { name: name.trim(), kind, color: "#FF5A1F", is_default: false } },
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
