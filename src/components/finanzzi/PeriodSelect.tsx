import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PeriodPreset } from "@/lib/finance";

export function PeriodSelect({
  preset,
  onPresetChange,
  custom,
  onCustomChange,
}: {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  custom: { from: string; to: string };
  onCustomChange: (custom: { from: string; to: string }) => void;
}) {
  return (
    <div className="fin-layout-transition flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Select value={preset} onValueChange={(v) => onPresetChange(v as PeriodPreset)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Este mês</SelectItem>
          <SelectItem value="previous">Mês anterior</SelectItem>
          <SelectItem value="last3">Últimos 3 meses</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {preset === "custom" && (
        <div className="animate-fin-enter grid min-w-0 grid-cols-1 gap-2 sm:flex sm:items-center">
          <Input
            type="date"
            className="w-full sm:w-[150px]"
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
          />
          <span className="hidden text-sm text-muted-foreground sm:inline">até</span>
          <Input
            type="date"
            className="w-[150px]"
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}