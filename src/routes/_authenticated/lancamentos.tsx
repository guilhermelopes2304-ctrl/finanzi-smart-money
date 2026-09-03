/* eslint-disable prettier/prettier */
import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCategories, useDeleteRow, useTransactions } from "@/hooks/useFinanceData";
import { formatBRL, formatDateBR, todayISO } from "@/lib/format";
import { PAYMENT_METHODS, type Transaction } from "@/types/finance";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { ViralMomentCard } from "@/components/finanzzi/ViralMomentCard";
import { ConfirmDelete } from "@/components/finanzzi/ConfirmDelete";
import { TransactionDialog } from "@/components/finanzzi/TransactionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TransactionBrandLogo } from "@/components/finanzzi/TransactionBrandLogo";

gsap.registerPlugin(useGSAP);

export const Route = createFileRoute("/_authenticated/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — FINANZZI" },
      {
        name: "description",
        content: "Registre, edite e acompanhe todas as suas receitas e despesas.",
      },
      { property: "og:title", content: "Lançamentos — FINANZZI" },
      { property: "og:description", content: "Todas as suas receitas e despesas em um só lugar." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const remove = useDeleteRow("transactions", "Lançamento excluído");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const installmentSummary = useMemo(() => {
    const future = transactions.filter(
      (tx) =>
        tx.type === "expense" && tx.date > todayISO() && Number(tx.installment_total ?? 0) > 1,
    );
    return {
      amount: future.reduce((sum, tx) => sum + Number(tx.amount), 0),
      count: future.length,
    };
  }, [transactions]);

  const rows = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      if (type !== "all" && tx.type !== type) return false;
      if (category !== "all" && tx.category_id !== category) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return Number(b.amount) - Number(a.amount);
        case "amount-asc":
          return Number(a.amount) - Number(b.amount);
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [transactions, type, category, search, sort]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-fin-history-item]", {
      y: 12,
      opacity: 0,
      duration: 0.38,
      ease: "power3.out",
      stagger: 0.045,
      clearProps: "transform,opacity",
    });
  }, { scope: rootRef, dependencies: [rows.length, filtersOpen] });

  return (
    <div ref={rootRef} className="fin-screen fin-transactions">
      <div data-fin-history-item><PageHeader
        title="Meu histórico"
        subtitle="Veja o que entrou e saiu. Para registrar algo novo, toque em Registrar."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Lançar
          </Button>
        }
      />
      </div>

      {installmentSummary.amount > 0 && (
        <div data-fin-history-item><ViralMomentCard
          className="mb-4"
          eyebrow="Parcelas futuras"
          title="Descobri quanto minhas parcelas vão consumir."
          value={formatBRL(installmentSummary.amount)}
          detail={`${installmentSummary.count} parcela(s) já comprometem os próximos meses`}
          shareText={`Descobri que minhas parcelas futuras vão consumir ${formatBRL(installmentSummary.amount)}. São ${installmentSummary.count} parcelas organizadas pelo FINANZZI.`}
          event="installment_moment_shared"
        />
        </div>
      )}

      <div data-fin-history-item className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {rows.length === 1 ? "1 registro no seu histórico." : `${rows.length} registros no seu histórico.`}
        </p>
        <button
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
          className={cn(
            "fin-interactive fin-pressable inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold",
            filtersOpen
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          <Filter className="size-4" /> Encontrar
        </button>
      </div>
      {filtersOpen && (
        <div data-fin-history-item className="surface-card fin-layout-transition mb-4 grid gap-3 p-4 animate-fin-enter sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Pesquisar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tudo</SelectItem>
              <SelectItem value="income">Entradas</SelectItem>
              <SelectItem value="expense">Saídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Mais novos primeiro</SelectItem>
              <SelectItem value="date-asc">Mais antigos primeiro</SelectItem>
              <SelectItem value="amount-desc">Maior valor primeiro</SelectItem>
              <SelectItem value="amount-asc">Menor valor primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Comece pelo que aconteceu hoje."
          description="Escreva algo como mercado 82 ou recebi 2.500 e deixe o FINANZZI organizar."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="size-4" /> Adicionar lançamento
            </Button>
          }
        />
      ) : (
        <div data-fin-history-item className="divide-y divide-border/70 overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_12px_36px_rgba(0,0,0,0.045)]">
          {rows.map((tx) => (
            <div
              key={tx.id}
              className="fin-interactive flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-primary/[0.035] sm:px-5"
            >
              <TransactionBrandLogo description={tx.description} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{tx.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateBR(tx.date)} ·{" "}
                  {categoryName.get(tx.category_id ?? "") ?? "Sem categoria"} ·{" "}
                  {PAYMENT_METHODS.find((m) => m.value === tx.payment_method)?.label}
                  {tx.installment_total
                    ? ` · Parcela ${tx.installment_number} de ${tx.installment_total}`
                    : ""}
                </p>
              </div>
              <span
                className={cn(
                  "font-display font-semibold",
                  tx.type === "income" ? "text-fin-success" : "text-foreground",
                )}
              >
                {tx.type === "income" ? "+" : "-"} {formatBRL(Number(tx.amount))}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar"
                  onClick={() => {
                    setEditing(tx);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <ConfirmDelete
                  title="Excluir lançamento?"
                  description="Este lançamento será removido dos seus relatórios."
                  onConfirm={() => remove.mutate(tx.id)}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Excluir">
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionDialog open={open} onOpenChange={setOpen} transaction={editing} />
    </div>
  );
}
