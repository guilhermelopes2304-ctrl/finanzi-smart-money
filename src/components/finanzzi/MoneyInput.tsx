import { Input } from "@/components/ui/input";
import { parseBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  id,
  placeholder = "0,00",
  required,
  className,
}: {
  value: string;
  onChange: (raw: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
      <Input
        id={id}
        inputMode="decimal"
        className={cn("pl-9", className)}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export { parseBRL };
