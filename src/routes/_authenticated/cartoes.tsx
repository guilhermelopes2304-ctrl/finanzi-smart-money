import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, CreditCard, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  useCategories,
  useCreateCardPurchase,
  useCreditCards,
  useDeleteRow,
  useSaveRow,
  useTransactions,
} from "@/hooks/useFinanceData";
import { cardInvoice, cardUsedLimit } from "@/lib/finance";
import { formatBRL, formatDateBR, parseBRL, todayISO } from "@/lib/format";
import { trackProductEvent } from "@/lib/product-analytics";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { ConfirmDelete } from "@/components/finanzzi/ConfirmDelete";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões — FINANZZI" },
      {
        name: "description",
        content: "Acompanhe limite, fatura e compras parceladas dos seus cartões.",
      },
      { property: "og:title", content: "Cartões — FINANZZI" },
      { property: "og:description", content: "Limite, fatura e parcelas sempre sob controle." },
    ],
  }),
  component: CardsPage,
});

const NONE = "__none__";

function CardsPage() {
  const { data: cards = [] } = useCreditCards();
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const saveCard = useSaveRow<Record<string, unknown>>("credit_cards", {
    successMessage: "Cartão salvo",
  });
  const removeCard = useDeleteRow("credit_cards", "Cartão excluído");
  const [openCard, setOpenCard] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const createPurchase = useCreateCardPurchase(() => setOpenPurchase(false));

  const [card, setCard] = useState({
    name: "",
    bank: "",
    credit_limit: "",
    closing_day: "1",
    due_day: "10",
  });
  const [purchase, setPurchase] = useState({
    credit_card_id: "",
    description: "",
    total_amount: "",
    purchase_date: todayISO(),
    installments: "1",
    category_id: NONE,
  });

  function submitCard(event: React.FormEvent) {
    event.preventDefault();
    saveCard.mutate(
      {
        values: {
          name: card.name,
          bank: card.bank || null,
          credit_limit: parseBRL(card.credit_limit),
          closing_day: Number(card.closing_day) || 1,
          due_day: Number(card.due_day) || 10,
        },
      },
      {
        onSuccess: () => {
          trackProductEvent("first_card");
          setOpenCard(false);
        },
      },
    );
  }

  function submitPurchase(event: React.FormEvent) {
    event.preventDefault();
    if (!purchase.credit_card_id) return;
    createPurchase.mutate({
      credit_card_id: purchase.credit_card_id,
      category_id: purchase.category_id === NONE ? null : purchase.category_id,
      description: purchase.description,
      total_amount: parseBRL(purchase.total_amount),
      purchase_date: purchase.purchase_date,
      installments: Math.max(1, Number(purchase.installments) || 1),
    });
  }

  return (
    <div>
      <PageHeader
        title="Cartões"
        subtitle="O que está disponível, o que já está na fatura e o que vem depois."
        action={
          <div className="flex gap-2">
            {cards.length > 0 && (
              <Dialog open={openPurchase} onOpenChange={setOpenPurchase}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="size-4" /> Lançar compra
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[92vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar compra no cartão</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={submitPurchase} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Cartão</Label>
                      <Select
                        value={purchase.credit_card_id}
                        onValueChange={(v) => setPurchase({ ...purchase, credit_card_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cartão" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-desc">Descrição</Label>
                      <Input
                        id="p-desc"
                        value={purchase.description}
                        onChange={(e) => setPurchase({ ...purchase, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="p-amount">Valor total</Label>
                        <MoneyInput
                          id="p-amount"
                          value={purchase.total_amount}
                          onChange={(v) => setPurchase({ ...purchase, total_amount: v })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="p-parts">Parcelas</Label>
                        <Input
                          id="p-parts"
                          type="number"
                          min={1}
                          max={72}
                          value={purchase.installments}
                          onChange={(e) =>
                            setPurchase({ ...purchase, installments: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="p-date">Data da compra</Label>
                        <Input
                          id="p-date"
                          type="date"
                          value={purchase.purchase_date}
                          onChange={(e) =>
                            setPurchase({ ...purchase, purchase_date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Categoria</Label>
                        <Select
                          value={purchase.category_id}
                          onValueChange={(v) => setPurchase({ ...purchase, category_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>Sem categoria</SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createPurchase.isPending}>
                        Registrar compra
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={openCard} onOpenChange={setOpenCard}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Novo cartão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo cartão</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitCard} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-name">Nome</Label>
                    <Input
                      id="c-name"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-bank">Banco</Label>
                    <Input
                      id="c-bank"
                      value={card.bank}
                      onChange={(e) => setCard({ ...card, bank: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-limit">Limite</Label>
                    <MoneyInput
                      id="c-limit"
                      value={card.credit_limit}
                      onChange={(v) => setCard({ ...card, credit_limit: v })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-close">Dia de fechamento</Label>
                      <Input
                        id="c-close"
                        type="number"
                        min={1}
                        max={31}
                        value={card.closing_day}
                        onChange={(e) => setCard({ ...card, closing_day: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-due">Dia de vencimento</Label>
                      <Input
                        id="c-due"
                        type="number"
                        min={1}
                        max={31}
                        value={card.due_day}
                        onChange={(e) => setCard({ ...card, due_day: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={saveCard.isPending}>
                      Salvar cartão
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {cards.length === 0 ? (
        <EmptyState
          title="Nenhum cartão cadastrado."
          description="Cadastre seus cartões para acompanhar limite e faturas."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((c) => {
            const used = cardUsedLimit(c, transactions);
            const limit = Number(c.credit_limit);
            const available = Math.max(0, limit - used);
            const usedPercent = limit ? Math.min(100, (used / limit) * 100) : 0;
            const invoice = cardInvoice(c, transactions);
            const purchases = transactions.filter((tx) => tx.credit_card_id === c.id).slice(0, 5);
            return (
              <div key={c.id} className="surface-card overflow-hidden p-0">
                <div
                  className="relative overflow-hidden p-5 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${c.color || "#556070"}, #111827)`,
                  }}
                >
                  <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-[#556070]/10 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4F5F8]/55">
                        Cartão FINANZZI
                      </p>
                      <p className="mt-4 text-lg font-semibold">{c.name}</p>
                      <p className="mt-1 text-xs text-[#F4F5F8]/55">
                        {c.bank ?? "Cartão de crédito"}
                      </p>
                    </div>
                    <CreditCard className="size-6 text-[#F4F5F8]/70" />
                  </div>
                  <div className="relative mt-8 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-[#F4F5F8]/50">Disponível</p>
                      <p className="mt-1 font-display text-2xl font-semibold">
                        {formatBRL(available)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#F4F5F8]/50">Próxima fatura</p>
                      <p className="mt-1 text-sm font-semibold">{formatBRL(invoice)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.bank ?? "Cartão de crédito"} · fecha dia {c.closing_day} · vence dia{" "}
                        {c.due_day}
                      </p>
                    </div>
                    <ConfirmDelete
                      title="Excluir cartão?"
                      description="As compras e parcelas vinculadas também serão removidas."
                      onConfirm={() => removeCard.mutate(c.id)}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Excluir">
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                      <Sparkles className="size-3.5" /> Peso no seu futuro
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(usedPercent)}% do limite usado
                    </span>
                  </div>
                  <Progress value={usedPercent} className="mt-3" />
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Limite</p>
                      <p className="font-medium">{formatBRL(limit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Utilizado</p>
                      <p className="font-medium">{formatBRL(used)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Disponível</p>
                      <p className="font-medium">{formatBRL(available)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fatura atual</p>
                      <p className="font-medium">{formatBRL(invoice)}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted/45 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="size-3.5 text-primary" />
                      <span>
                        Fecha dia <strong>{c.closing_day}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      Vence dia <strong>{c.due_day}</strong>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Últimas compras</p>
                    {purchases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma compra registrada ainda.
                      </p>
                    ) : (
                      purchases.map((tx) => (
                        <div key={tx.id} className="flex justify-between text-sm">
                          <span className="truncate">
                            {tx.description}{" "}
                            <span className="text-xs text-muted-foreground">
                              {formatDateBR(tx.date)}
                            </span>
                          </span>
                          <span className="font-medium">{formatBRL(Number(tx.amount))}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
