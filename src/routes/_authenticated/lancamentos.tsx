/* eslint-disable prettier/prettier */
import { useMemo, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { TransactionBrandLogo } from "@/components/finanzzi/TransactionBrandLogo";
import { historyCategoryLabel, sanitizeTransactionDescription } from "@/lib/history-format";

gsap.registerPlugin(useGSAP);

export const Route = createFileRoute("/_authenticated/lancamentos")({
  head: () => ({ meta: [{ title: "Histórico — FINANZZI" }, { name: "description", content: "Veja e organize todas as suas receitas e despesas." }] }),
  component: TransactionsPage,
});

type FilterType = "all" | "expense" | "income";
type DayGroup = { items: Transaction[]; total: number };

function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const remove = useDeleteRow("transactions", "Lançamento excluído");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<FilterType>("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [visibleCount, setVisibleCount] = useState(30);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const installmentSummary = useMemo(() => {
    const future = transactions.filter((tx) => tx.type === "expense" && tx.date > todayISO() && Number(tx.installment_total ?? 0) > 1);
    return { amount: future.reduce((sum, tx) => sum + Number(tx.amount), 0), count: future.length };
  }, [transactions]);

  const rows = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      if (type !== "all" && tx.type !== type) return false;
      if (category !== "all" && tx.category_id !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLocaleLowerCase("pt-BR");
        const payment = PAYMENT_METHODS.find((m) => m.value === tx.payment_method)?.label ?? "";
        const categoryLabel = historyCategoryLabel(tx.description, tx.type, categories, tx.category_id);
        if (![tx.description, payment, categoryLabel].join(" ").toLocaleLowerCase("pt-BR").includes(q)) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "date-asc": return a.date.localeCompare(b.date);
        case "amount-desc": return Number(b.amount) - Number(a.amount);
        case "amount-asc": return Number(a.amount) - Number(b.amount);
        default: return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [transactions, type, category, search, sort, categories]);

  const visibleRows = rows.slice(0, visibleCount);
  const groupedRows = useMemo(() => {
    const groups = new Map<string, DayGroup>();
    visibleRows.forEach((tx) => {
      const current = groups.get(tx.date) ?? { items: [], total: 0 };
      current.items.push(tx);
      current.total += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
      groups.set(tx.date, current);
    });
    return [...groups.entries()];
  }, [visibleRows]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-fin-history-item]", { y: 10, opacity: 0, duration: 0.34, ease: "power3.out", stagger: 0.035, clearProps: "transform,opacity" });
  }, { scope: rootRef, dependencies: [visibleRows.length, filtersOpen, type] });

  const openNew = () => { setEditing(null); setOpen(true); };
  const resetFilters = () => { setSearch(""); setType("all"); setCategory("all"); setSort("date-desc"); setVisibleCount(30); };
  const formatDay = (date: string) => {
    const today = todayISO();
    const yesterday = new Date(`${today}T12:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().slice(0, 10);
    if (date === today) return "Hoje";
    if (date === yesterdayISO) return "Ontem";
    return formatDateBR(date);
  };
  const hasActiveFilters = Boolean(search.trim()) || type !== "all" || category !== "all" || sort !== "date-desc";

  return (
    <div ref={rootRef} className="fin-screen fin-transactions w-full max-w-4xl mx-auto pb-10">
      <div data-fin-history-item>
        <PageHeader title="Meu histórico" subtitle={`${rows.length} ${rows.length === 1 ? "registro encontrado" : "registros encontrados"}`} action={<Button onClick={openNew}><Plus className="size-4" /> Lançar</Button>} />
      </div>

      {installmentSummary.amount > 0 && <div data-fin-history-item><ViralMomentCard className="mb-4" eyebrow="Parcelas futuras" title="Descobri quanto minhas parcelas vão consumir." value={formatBRL(installmentSummary.amount)} detail={`${installmentSummary.count} parcela(s) já comprometem os próximos meses`} shareText={`Descobri que minhas parcelas futuras vão consumir ${formatBRL(installmentSummary.amount)}. São ${installmentSummary.count} parcelas organizadas pelo FINANZZI.`} event="installment_moment_shared" /></div>}

      <section data-fin-history-item className="mb-5 space-y-3">
        <div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(30); }} placeholder="Buscar Uber, Mercado, VR..." className="h-12 rounded-2xl border-border bg-card pl-11 pr-4 shadow-sm focus-visible:ring-1 focus-visible:ring-primary" aria-label="Buscar no histórico" /></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {([["all", "Todos"], ["expense", "Despesas"], ["income", "Receitas"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setType(value); setVisibleCount(30); }} className={cn("fin-interactive fin-pressable shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all", type === value ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted")}>{label}</button>)}
          <button type="button" onClick={() => setFiltersOpen((value) => !value)} className={cn("fin-interactive fin-pressable ml-auto shrink-0 rounded-full border px-3 py-2 text-xs font-semibold", filtersOpen ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground")}><Filter className="mr-1 inline size-3.5" /> Mais filtros</button>
        </div>
        {filtersOpen && <div className="surface-card grid gap-3 rounded-2xl p-4 animate-fin-enter sm:grid-cols-2 lg:grid-cols-3">
          <SelectLike label="Categoria"><select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleCount(30); }} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"><option value="all">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></SelectLike>
          <SelectLike label="Ordenar"><select value={sort} onChange={(event) => { setSort(event.target.value); setVisibleCount(30); }} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"><option value="date-desc">Mais novos primeiro</option><option value="date-asc">Mais antigos primeiro</option><option value="amount-desc">Maior valor primeiro</option><option value="amount-asc">Menor valor primeiro</option></select></SelectLike>
          {hasActiveFilters && <div className="flex items-end"><Button variant="outline" className="w-full" onClick={resetFilters}>Limpar filtros</Button></div>}
        </div>}
      </section>

      {isLoading ? <div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div> : rows.length === 0 ? <div className="rounded-[28px] border border-border/70 bg-card p-10 text-center shadow-sm"><Search className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 text-sm font-bold text-foreground">Nenhum lançamento encontrado</p><p className="mt-1 text-xs text-muted-foreground">Tente outro termo ou limpe os filtros para ver seu histórico.</p><Button variant="outline" className="mt-5" onClick={resetFilters}>Limpar filtros</Button></div> : <div className="space-y-7">
        {groupedRows.map(([date, group]) => <section key={date} data-fin-history-item>
          <div className="mb-2 flex items-center justify-between px-1"><div className="flex min-w-0 items-center gap-2"><CalendarDays className="size-3.5 shrink-0 text-muted-foreground" /><h2 className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{formatDay(date)}</h2></div><span className={cn("shrink-0 text-xs font-bold tabular-nums", group.total >= 0 ? "text-fin-success" : "text-foreground")}>{group.total >= 0 ? "+" : "-"} {formatBRL(Math.abs(group.total))}</span></div>
          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-sm">
            {group.items.map((tx) => {
              const title = sanitizeTransactionDescription(tx.description, tx.type);
              const categoryLabel = historyCategoryLabel(tx.description, tx.type, categories, tx.category_id);
              const payment = PAYMENT_METHODS.find((m) => m.value === tx.payment_method)?.label;
              return <div key={tx.id} className="group flex min-w-0 items-center gap-3 border-b border-border/60 px-3 py-3.5 last:border-b-0 transition-colors hover:bg-primary/[0.035] sm:px-4">
                <div className="shrink-0 rounded-full bg-neutral-900 p-0.5"><TransactionBrandLogo description={title} /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{title}</p><div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"><span className="truncate">{categoryLabel}</span>{payment && <><span aria-hidden="true">•</span><span className="truncate">{payment}</span></>}</div></div>
                <div className="flex shrink-0 items-center gap-1"><span className={cn("whitespace-nowrap text-sm font-extrabold tabular-nums", tx.type === "income" ? "text-fin-success" : "text-foreground")}>{tx.type === "income" ? "+" : "-"} {formatBRL(Number(tx.amount))}</span><div className="flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setEditing(tx); setOpen(true); }}><Pencil className="size-4" /></Button><ConfirmDelete title="Excluir lançamento?" description="Este lançamento será removido dos seus relatórios." onConfirm={() => remove.mutate(tx.id)} trigger={<Button size="icon" variant="ghost" aria-label="Excluir"><Trash2 className="size-4 text-danger" /></Button>} /></div></div>
              </div>;
            })}
          </div>
        </section>)}
        {visibleRows.length < rows.length && <div className="flex justify-center pt-1"><Button variant="outline" onClick={() => setVisibleCount((count) => count + 30)}>Carregar mais</Button></div>}
      </div>}

      <TransactionDialog open={open} onOpenChange={setOpen} transaction={editing} />
    </div>
  );
}

function SelectLike({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1.5 text-xs font-semibold text-muted-foreground"><span>{label}</span>{children}</label>;
}
