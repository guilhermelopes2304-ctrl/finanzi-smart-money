import { useMemo, useState } from "react";
import { Filter, Pencil, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/lancamentos")({
  head: () => ({
    meta: [
      { title: "Movimentações — FINANZZI" },
      { name: "description", content: "Acompanhe suas receitas e despesas em uma visão simples e clara." },
      { property: "og:title", content: "Movimentações — FINANZZI" },
      { property: "og:description", content: "Todas as suas receitas e despesas em um só lugar." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const remove = useDeleteRow("transactions", "Movimentação excluída");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const installmentSummary = useMemo(() => {
    const future = transactions.filter((tx) => tx.type === "expense" && tx.date > todayISO() && Number(tx.installment_total ?? 0) > 1);
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
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "date-asc": return a.date.localeCompare(b.date);
        case "amount-desc": return Number(b.amount) - Number(a.amount);
        case "amount-asc": return Number(a.amount) - Number(b.amount);
        default: return b.date.localeCompare(a.date);
      }
    });
  }, [transactions, type, category, search, sort]);

  return (
    <div>
      <PageHeader
        title="Movimentações"
        subtitle="Tudo que entrou e saiu, organizado sem complicação."
        action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="size-4" /> Lançar</Button>}
      />

      {installmentSummary.amount > 0 && (
        <ViralMomentCard
          className="mb-4"
          eyebrow="Parcelas futuras"
          title="Descobri quanto minhas parcelas vão consumir."
          value={formatBRL(installmentSummary.amount)}
          detail={`${installmentSummary.count} parcela(s) já comprometem os próximos meses`}
          shareText={`Descobri que minhas parcelas futuras vão consumir ${formatBRL(installmentSummary.amount)}. São ${installmentSummary.count} parcelas organizadas pelo FINANZZI.`}
          event="installment_moment_shared"
        />
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{rows.length} movimentação(ões) no seu histórico.</p>
        <button
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
          className={cn("inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors", filtersOpen ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
        >
          <Filter className="size-4" /> Filtrar
        </button>
      </div>

      {filtersOpen && (
        <div className="surface-card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem><SelectItem value="income">Receitas</SelectItem><SelectItem value="expense">Despesas</SelectItem></SelectContent></Select>
          <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="date-desc">Mais recentes</SelectItem><SelectItem value="date-asc">Mais antigos</SelectItem><SelectItem value="amount-desc">Maior valor</SelectItem><SelectItem value="amount-asc">Menor valor</SelectItem></SelectContent></Select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Comece pelo que aconteceu hoje."
          description="Escreva algo como mercado 82 ou recebi 2.500 e deixe o FINANZZI organizar."
          action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="size-4" /> Adicionar movimentação</Button>}
        />
      ) : (
        <div className="space-y-2">
          {rows.map((tx) => {
            const categoryInfo = categoryMap.get(tx.category_id ?? "");
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} className="group flex items-center gap-3 rounded-[1.35rem] border border-border bg-card px-3.5 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm sm:px-4">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-2xl"
                  style={{ backgroundColor: `${categoryInfo?.color ?? "#667085"}18`, color: categoryInfo?.color ?? "#667085" }}
                  aria-hidden="true"
                >
                  <ReceiptText className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{tx.description}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {categoryInfo?.name ?? "Sem categoria"} · {formatDateBR(tx.date)} · {PAYMENT_METHODS.find((m) => m.value === tx.payment_method)?.label}
                    {tx.installment_total ? ` · ${tx.installment_number}/${tx.installment_total}` : ""}
                  </p>
                </div>
                <span className={cn("shrink-0 text-sm font-bold tabular-nums sm:text-base", isIncome ? "text-fin-success" : "text-foreground")}>
                  {isIncome ? "+" : "−"} {formatBRL(Number(tx.amount))}
                </span>
                <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setEditing(tx); setOpen(true); }}><Pencil className="size-4" /></Button>
                  <ConfirmDelete title="Excluir movimentação?" description="Esta movimentação será removida dos seus relatórios." onConfirm={() => remove.mutate(tx.id)} trigger={<Button size="icon" variant="ghost" aria-label="Excluir"><Trash2 className="size-4 text-danger" /></Button>} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TransactionDialog open={open} onOpenChange={setOpen} transaction={editing} />
    </div>
  );
}
