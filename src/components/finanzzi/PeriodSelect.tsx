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
    <div className="fin-layout-transition flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(v) => onPresetChange(v as PeriodPreset)}>
        <SelectTrigger className="w-[180px]">
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
        <div className="animate-fin-enter flex items-center gap-2">
          <Input
            type="date"
            className="w-[150px]"
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
          />
          <span className="text-sm text-muted-foreground">até</span>
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