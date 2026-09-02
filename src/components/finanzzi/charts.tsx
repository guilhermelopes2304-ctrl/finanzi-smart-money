import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL, formatCompactBRL } from "@/lib/format";
import type { CategorySlice, MonthlyPoint } from "@/lib/finance";

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  fontSize: "13px",
  color: "var(--color-card-foreground)",
};

export function IncomeExpenseChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v: number) => formatCompactBRL(v)} width={72} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name) => [formatBRL(value), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Receitas" fill="var(--color-success)" radius={[6, 6, 0, 0]} animationDuration={420} animationEasing="ease-out" isAnimationActive />
        <Bar dataKey="expense" name="Despesas" fill="var(--color-danger)" radius={[6, 6, 0, 0]} animationDuration={420} animationEasing="ease-out" isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} animationDuration={420} animationEasing="ease-out" isAnimationActive>
          {data.map((slice) => (
            <Cell key={slice.id} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatBRL(value)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BalanceEvolutionChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v: number) => formatCompactBRL(v)} width={72} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatBRL(value)} />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Saldo acumulado"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#balanceFill)"
          animationDuration={420}
          animationEasing="ease-out"
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}