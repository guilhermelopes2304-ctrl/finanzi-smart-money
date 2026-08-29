/* eslint-disable prettier/prettier */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Plus, Target, Trash2 } from "lucide-react";
import { useDeleteRow, useGoals, useSaveRow } from "@/hooks/useFinanceData";
import { goalMonthlyTarget } from "@/lib/finance";
import { formatBRL, formatDateBR, parseBRL } from "@/lib/format";
import { trackProductEvent } from "@/lib/product-analytics";
import { PageHeader } from "@/components/finanzzi/PageHeader";
import { EmptyState } from "@/components/finanzzi/EmptyState";
import { ConfirmDelete } from "@/components/finanzzi/ConfirmDelete";
import { MoneyInput } from "@/components/finanzzi/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Objetivos — FINANZZI" },
      {
        name: "description",
        content: "Planeje viagens, reservas e conquistas com metas financeiras.",
      },
      { property: "og:title", content: "Metas — FINANZZI" },
      { property: "og:description", content: "Acompanhe o progresso das suas metas financeiras." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const save = useSaveRow<Record<string, unknown>>("goals", { successMessage: "Meta salva" });
  const remove = useDeleteRow("goals", "Meta excluída");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
    description: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    save.mutate(
      {
        values: {
          name: form.name,
          target_amount: parseBRL(form.target_amount),
          current_amount: parseBRL(form.current_amount),
          deadline: form.deadline || null,
          description: form.description || null,
        },
      },
      {
        onSuccess: () => {
          trackProductEvent("first_goal");
          setOpen(false);
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Meus objetivos"
        subtitle="Escolha algo importante e acompanhe seu progresso sem fazer contas."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Criar objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo objetivo</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-name">Nome do objetivo</Label>
                  <Input
                    id="goal-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex.: Reserva de emergência"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-target">Valor alvo</Label>
                    <MoneyInput
                      id="goal-target"
                      value={form.target_amount}
                      onChange={(v) => setForm({ ...form, target_amount: v })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-current">Valor atual</Label>
                    <MoneyInput
                      id="goal-current"
                      value={form.current_amount}
                      onChange={(v) => setForm({ ...form, current_amount: v })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-deadline">Prazo</Label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-desc">Descrição</Label>
                  <Textarea
                    id="goal-desc"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={save.isPending}>
                    Salvar objetivo
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          title="Ainda não há nenhum objetivo por aqui."
          description="Escolha algo que você quer conquistar e acompanhe o caminho aos poucos."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const target = Number(goal.target_amount);
            const current = Number(goal.current_amount);
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const monthly = goalMonthlyTarget(goal);
            return (
              <div key={goal.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-xl bg-fin-brand-soft text-fin-brand-hover">
                        <Target className="size-4" />
                      </span>
                      <p className="truncate font-display text-lg font-semibold">{goal.name}</p>
                    </div>
                    {goal.description && (
                      <p className="mt-2 text-xs text-fin-copy">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const input = window.prompt("Quanto você quer adicionar a esta meta?", "0");
                        if (input === null) return;
                        const value = parseBRL(input);
                        if (value <= 0) return;
                        save.mutate({ id: goal.id, values: { current_amount: current + value } });
                      }}
                    >
                      Adicionar
                    </Button>
                    <ConfirmDelete
                      title="Excluir objetivo?"
                      onConfirm={() => remove.mutate(goal.id)}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Excluir">
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-fin-copy">Você já juntou</p>
                    <p className="mt-1 font-display text-3xl font-semibold">{formatBRL(current)}</p>
                  </div>
                  <p className="text-right text-sm text-fin-copy">
                    de <strong className="text-foreground">{formatBRL(target)}</strong>
                    <br />
                    {pct}%
                  </p>
                </div>
                <Progress value={pct} className="mt-4" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-fin-copy">
                  <span>{formatBRL(Math.max(0, target - current))} faltam</span>
                  {goal.deadline && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3" /> até {formatDateBR(goal.deadline)}
                    </span>
                  )}
                </div>
                {monthly !== null && monthly > 0 && (
                  <p className="mt-4 text-sm text-fin-copy">
                    Para chegar até o prazo, tente guardar cerca de <strong className="text-foreground">{formatBRL(monthly)}</strong> por
                    mês até o prazo.
                  </p>
                )}
                {pct >= 100 && (
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                    <Check className="size-4" /> Objetivo alcançado.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
