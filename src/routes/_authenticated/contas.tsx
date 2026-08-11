import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  useAccounts,
  useBills,
  useCategories,
  useDeleteRow,
  useSaveRow,
  useTransactions,
} from "@/hooks/useFinanceData";
import { accountBalance, billStatus } from "@/lib/finance";
import { addDaysISO, formatBRL, formatDateBR, parseBRL, todayISO } from "@/lib/format";
import { ACCOUNT_TYPES, RECURRENCES, type Bill, type Recurrence } from "@/types/finance";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { ConfirmDelete } from "@/components/finanzzi/ConfirmDelete";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({
    meta: [
      { title: "Contas — FINANZZI" },
      { name: "description", content: "Controle contas a pagar, vencimentos e suas contas bancárias." },
      { property: "og:title", content: "Contas — FINANZZI" },
      { property: "og:description", content: "Nunca perca de vista seus próximos vencimentos." },
    ],
  }),
  component: BillsPage,
});

const NONE = "__none__";

function BillsPage() {
  return (
    <div>
      <PageHeader title="Contas" subtitle="Seus vencimentos e suas contas bancárias." />
      <Tabs defaultValue="bills">
        <TabsList className="mb-4">
          <TabsTrigger value="bills">A pagar</TabsTrigger>
          <TabsTrigger value="accounts">Minhas contas</TabsTrigger>
        </TabsList>
        <TabsContent value="bills">
          <BillsTab />
        </TabsContent>
        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BillsTab() {
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const save = useSaveRow<Record<string, unknown>>("bills", { successMessage: "Conta salva" });
  const remove = useDeleteRow("bills", "Conta excluída");
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "late">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    due_date: todayISO(),
    category_id: NONE,
    account_id: NONE,
    recurrence: "none" as Recurrence,
    notes: "",
  });

  const rows = useMemo(
    () => bills.filter((b) => (filter === "all" ? true : billStatus(b) === filter)),
    [bills, filter],
  );
  const next7 = bills.filter(
    (b) => billStatus(b) !== "paid" && b.due_date >= todayISO() && b.due_date <= addDaysISO(todayISO(), 7),
  );
  const next30 = bills.filter(
    (b) => billStatus(b) !== "paid" && b.due_date >= todayISO() && b.due_date <= addDaysISO(todayISO(), 30),
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();
    save.mutate(
      {
        values: {
          description: form.description,
          amount: parseBRL(form.amount),
          due_date: form.due_date,
          category_id: form.category_id === NONE ? null : form.category_id,
          account_id: form.account_id === NONE ? null : form.account_id,
          recurrence: form.recurrence,
          notes: form.notes || null,
          status: "pending",
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ ...form, description: "", amount: "", notes: "" });
        },
      },
    );
  }

  function markPaid(bill: Bill) {
    save.mutate({ id: bill.id, values: { status: "paid", paid_at: todayISO() } });
  }

  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-4">
          <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
          <p className="font-display text-xl font-semibold">
            {formatBRL(next7.reduce((s, b) => s + Number(b.amount), 0))}
          </p>
          <p className="text-xs text-muted-foreground">{next7.length} conta(s) a vencer</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
          <p className="font-display text-xl font-semibold">
            {formatBRL(next30.reduce((s, b) => s + Number(b.amount), 0))}
          </p>
          <p className="text-xs text-muted-foreground">{next30.length} conta(s) a vencer</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "pending", "paid", "late"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {{ all: "Todas", pending: "Pendentes", paid: "Pagas", late: "Atrasadas" }[f]}
          </button>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="size-4" /> Nova conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova conta a pagar</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bill-desc">Descrição</Label>
                <Input
                  id="bill-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bill-amount">Valor</Label>
                  <MoneyInput
                    id="bill-amount"
                    value={form.amount}
                    onChange={(v) => setForm({ ...form, amount: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bill-due">Vencimento</Label>
                  <Input
                    id="bill-due"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(v) => setForm({ ...form, category_id: v })}
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
                <div className="space-y-1.5">
                  <Label>Conta</Label>
                  <Select
                    value={form.account_id}
                    onValueChange={(v) => setForm({ ...form, account_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem conta</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Recorrência</Label>
                <Select
                  value={form.recurrence}
                  onValueChange={(v) => setForm({ ...form, recurrence: v as Recurrence })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
                  Salvar conta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma conta por aqui."
          description="Cadastre suas contas para acompanhar os vencimentos."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((bill) => {
            const status = billStatus(bill);
            return (
              <div key={bill.id} className="surface-card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{bill.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence em {formatDateBR(bill.due_date)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    status === "paid"
                      ? "bg-success/15 text-success"
                      : status === "late"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/20 text-warning",
                  )}
                >
                  {{ paid: "Pago", late: "Atrasado", pending: "Pendente" }[status]}
                </span>
                <span className="font-display font-semibold">{formatBRL(Number(bill.amount))}</span>
                <div className="flex gap-1">
                  {status !== "paid" && (
                    <Button size="sm" variant="outline" onClick={() => markPaid(bill)}>
                      <CheckCircle2 className="size-4" /> Pagar
                    </Button>
                  )}
                  <ConfirmDelete
                    title="Excluir conta?"
                    onConfirm={() => remove.mutate(bill.id)}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label="Excluir">
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccountsTab() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const save = useSaveRow<Record<string, unknown>>("accounts", { successMessage: "Conta salva" });
  const remove = useDeleteRow("accounts", "Conta excluída");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", bank: "", type: "corrente", initial_balance: "" });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    save.mutate(
      {
        values: {
          name: form.name,
          bank: form.bank || null,
          type: form.type,
          initial_balance: parseBRL(form.initial_balance),
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> Nova conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova conta financeira</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="acc-name">Nome</Label>
                <Input
                  id="acc-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-bank">Banco</Label>
                <Input
                  id="acc-bank"
                  value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-balance">Saldo inicial</Label>
                <MoneyInput
                  id="acc-balance"
                  value={form.initial_balance}
                  onChange={(v) => setForm({ ...form, initial_balance: v })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="Você ainda não cadastrou contas."
          description="Cadastre onde seu dinheiro fica guardado para acompanhar o saldo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.bank ?? ACCOUNT_TYPES.find((t) => t.value === account.type)?.label}
                  </p>
                </div>
                <ConfirmDelete
                  title="Excluir conta?"
                  onConfirm={() => remove.mutate(account.id)}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label="Excluir">
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  }
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Saldo atual</p>
              <p className="font-display text-xl font-semibold">
                {formatBRL(accountBalance(account, transactions))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}