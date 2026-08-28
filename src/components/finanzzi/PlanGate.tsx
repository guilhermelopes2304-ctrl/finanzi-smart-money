import { useState, type ReactNode } from "react";
import { ArrowRight, Check, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlan } from "@/hooks/usePlan";
import { PRO_FEATURE_LABELS, type ProFeature } from "@/lib/plan";
import { BILLING_PLANS, getHublaCheckoutUrl, type BillingInterval } from "@/lib/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export function PlanGate({
  feature,
  children,
  className,
}: {
  feature: ProFeature;
  children: ReactNode;
  className?: string;
}) {
  const { isPro, isLoading } = usePlan();
  const [open, setOpen] = useState(false);

  if (isLoading || isPro) return <>{children}</>;

  return (
    <div className={className}>
      <ProUpsell
        feature={feature}
        onOpen={() => {
          trackProductEvent("pro_viewed");
          setOpen(true);
        }}
      />
      {open && <ProModal feature={feature} open={open} onOpenChange={setOpen} />}
    </div>
  );
}

export function ProUpsell({ feature, onOpen }: { feature: ProFeature; onOpen?: () => void }) {
  const copy = PRO_FEATURE_LABELS[feature];
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/20 bg-[#111827] p-5 text-white shadow-soft sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[#FF5A1F]/15 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F] text-[#111827]">
          <LockKeyhole className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">
            Acesso completo
          </p>
          <h3 className="mt-1 text-lg font-semibold">{copy.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#F4F5F8]/65">{copy.benefit}</p>
        </div>
      </div>
      <div className="relative mt-5 rounded-2xl border border-[#556070]/10 bg-white/[0.06] p-3 text-sm text-[#F4F5F8]/75">
        <span className="text-[#FF5A1F]">Exemplo:</span> {copy.example}
      </div>
      <Button
        type="button"
        onClick={onOpen}
        className="relative mt-5 h-11 rounded-xl bg-[#FF5A1F] px-4 font-bold text-[#111827] hover:bg-[#FF5A1F]"
      >
        Ver oferta <ArrowRight className="ml-auto size-4" />
      </Button>
    </div>
  );
}

export function ProModal({
  feature,
  open,
  onOpenChange,
}: {
  feature?: ProFeature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const focus = feature ? PRO_FEATURE_LABELS[feature] : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] p-0 sm:max-w-3xl">
        <div className="overflow-hidden rounded-[1.75rem]">
          <div className="relative bg-[#111827] p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#FF5A1F]/15 blur-3xl" />
            <DialogHeader className="relative">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#556070]/20 bg-[#FF5A1F]/10 px-3 py-1.5 text-xs font-bold text-[#FF5A1F]">
                <Sparkles className="size-3.5" /> Acesso completo FINANZZI
              </div>
              <DialogTitle className="font-display text-3xl font-semibold text-white">
                Seu dinheiro pode trabalhar melhor.
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-6 text-[#F4F5F8]/65">
                {focus
                  ? `${focus.title} faz parte do acesso completo ao FINANZZI.`
                  : "Registro, organização, lembretes e orientação num único acesso."}
              </DialogDescription>
            </DialogHeader>
          </div>
          <BillingOffer onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillingOffer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<"pro_monthly" | "pro_annual">("pro_annual");
  const [status, setStatus] = useState<string | null>(null);
  const selectedPlan = BILLING_PLANS[selected];

  function handleCheckout() {
    setStatus(null);
    const checkoutUrl = getHublaCheckoutUrl(selected);
    if (!checkoutUrl) {
      setStatus(
        "Checkout Hubla ainda não configurado. Nenhuma cobrança foi criada e o acesso continua bloqueado até a configuração do provedor.",
      );
      toast.info("Checkout pendente", {
        description: "Configure a oferta Hubla do FINANZZI para ativar as vendas.",
      });
      return;
    }
    trackProductEvent("checkout_started");
    window.location.assign(checkoutUrl);
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-center text-sm">
        <span className="text-muted-foreground">Preço de referência: R$ 97</span>
        <span className="mx-2 text-muted-foreground/50">·</span>
        <strong>Oferta planejada: {selectedPlan.priceLabel}</strong>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PlanChoice
          title="FINANZZI Mensal"
          price={BILLING_PLANS.pro_monthly.priceLabel}
          detail={BILLING_PLANS.pro_monthly.savingsLabel}
          selected={selected === "pro_monthly"}
          interval="monthly"
          onSelect={() => setSelected("pro_monthly")}
        />
        <PlanChoice
          title="FINANZZI Anual"
          price={BILLING_PLANS.pro_annual.priceLabel}
          detail={BILLING_PLANS.pro_annual.savingsLabel}
          selected={selected === "pro_annual"}
          interval="annual"
          onSelect={() => setSelected("pro_annual")}
        />
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-5">
        <p className="text-sm font-semibold">O acesso completo inclui</p>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Registro por texto e voz",
            "Contas, assinaturas e lembretes",
            "Parcelas, cartões e metas",
            "FIN com contexto financeiro",
            "Análises e direcionamentos",
            "Histórico e relatórios completos",
          ].map((item) => (
            <p key={item} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" /> {item}
            </p>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted/45 p-4">
          <p className="text-sm font-semibold">Preço transparente</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {selectedPlan.priceLabel} · {selectedPlan.monthlyEquivalentLabel}.{" "}
            {selectedPlan.savingsLabel}.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/45 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Sem surpresas
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Cancelamento transparente, dados preservados e nenhuma cobrança é criada enquanto o
            provedor não estiver configurado.
          </p>
        </div>
      </div>
      {status && (
        <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm font-medium text-primary">
          {status}
        </div>
      )}
      <div className="rounded-2xl border border-border p-4">
        <p className="text-sm font-semibold">Perguntas rápidas</p>
        <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Quando o acesso é liberado?</strong> Somente depois
            de o backend confirmar o pagamento aprovado pelo provedor.
          </p>
          <p>
            <strong className="text-foreground">Posso cancelar?</strong> Sim. O cancelamento será
            tratado pelo provedor configurado, sem apagar os seus dados.
          </p>
          <p>
            <strong className="text-foreground">Já existe cobrança?</strong> Não. O checkout está
            preparado, mas nenhum gateway foi ligado ainda.
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
          Voltar
        </Button>
        <Button type="button" onClick={() => void handleCheckout()} className="rounded-xl">
          {getHublaCheckoutUrl(selected) ? "Ir para o checkout" : "Checkout pendente"}{" "}
          <ArrowRight className="ml-auto size-4" />
        </Button>
      </div>
    </div>
  );
}

function PlanChoice({
  title,
  price,
  detail,
  selected,
  interval,
  onSelect,
}: {
  title: string;
  price: string;
  detail: string;
  selected: boolean;
  interval: BillingInterval;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "rounded-2xl border-2 border-primary bg-primary/[0.06] p-4 text-left shadow-sm"
          : "rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xl font-bold tracking-tight">{price}</p>
        </div>
        <span
          className={
            selected
              ? "grid size-5 place-items-center rounded-full border-4 border-primary"
              : "size-5 rounded-full border border-border"
          }
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {interval === "annual" ? "Melhor valor para consistência" : "Comece com flexibilidade"}
      </p>
      <p className="mt-1 text-xs font-semibold text-primary">{detail}</p>
    </button>
  );
}

function PlanColumn({
  title,
  items,
  emphasized = false,
}: {
  title: string;
  items: string[];
  emphasized?: boolean;
}) {
  return (
    <div
      className={
        emphasized
          ? "rounded-2xl border border-primary/30 bg-primary/[0.06] p-4"
          : "rounded-2xl border border-border bg-card p-4"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        {emphasized && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            Mais contexto
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check
              className={
                emphasized
                  ? "mt-0.5 size-4 shrink-0 text-primary"
                  : "mt-0.5 size-4 shrink-0 text-muted-foreground"
              }
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
