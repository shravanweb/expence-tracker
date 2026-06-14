import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import type { Transaction } from "./TransactionsList";
import { formatCurrency } from "@/lib/categories";
import { getTransactionMonthKey } from "@/lib/month-utils";

type Props = { transactions: Transaction[] };

const PIE_COLORS = [
  "oklch(0.78 0.17 165)",
  "oklch(0.65 0.21 295)",
  "oklch(0.82 0.17 80)",
  "oklch(0.7 0.18 30)",
  "oklch(0.7 0.16 220)",
  "oklch(0.75 0.16 340)",
  "oklch(0.72 0.16 130)",
];

export function MonthlyChart({ transactions }: Props) {
  const data = useMemo(() => {
    const months: { key: string; label: string; credit: number; debit: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM"), credit: 0, debit: 0 });
    }
    const map = new Map(months.map((m) => [m.key, m]));
    for (const t of transactions) {
      const k = getTransactionMonthKey(t.transaction_date);
      const slot = map.get(k);
      if (slot) {
        if (t.type === "credit") slot.credit += Number(t.amount);
        else slot.debit += Number(t.amount);
      }
    }
    return months;
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Last 6 months</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.025 255)" vertical={false} />
            <XAxis dataKey="label" stroke="oklch(0.68 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.68 0.03 255)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
            <Tooltip
              cursor={{ fill: "oklch(0.27 0.03 255 / 0.4)" }}
              contentStyle={{
                background: "oklch(0.21 0.025 250)",
                border: "1px solid oklch(0.3 0.025 255)",
                borderRadius: 12,
              }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Bar dataKey="credit" name="Credit" fill="oklch(0.78 0.17 165)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="debit" name="Debit" fill="oklch(0.65 0.21 295)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type CategoryPieProps = Props & { monthKey?: string };

export function CategoryPie({ transactions, monthKey }: CategoryPieProps) {
  const data = useMemo(() => {
    const key = monthKey ?? format(new Date(), "yyyy-MM");
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "debit") continue;
      const k = getTransactionMonthKey(t.transaction_date);
      if (k !== key) continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + Number(t.amount));
    }
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, monthKey]);

  const monthTitle = monthKey
    ? format(new Date(`${monthKey}-01`), "MMMM yyyy")
    : format(new Date(), "MMMM yyyy");

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
        {monthTitle} — spending by category
      </h3>
      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No expenses in this month yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="oklch(0.21 0.025 250)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "oklch(0.21 0.025 250)",
                  border: "1px solid oklch(0.3 0.025 255)",
                  borderRadius: 12,
                }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
