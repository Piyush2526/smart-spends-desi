import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { CategoryChip } from "@/components/CategoryChip";
import { useExpenses } from "@/hooks/use-expenses";
import { CATEGORIES, categoryById, formatINR } from "@/lib/expenses";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Spending Dashboard — PaisaWise" },
      {
        name: "description",
        content:
          "See where your rupees go: category breakdown pie chart, last-7-days bar chart and your biggest single expense.",
      },
      { property: "og:title", content: "Spending Dashboard — PaisaWise" },
      {
        property: "og:description",
        content: "Category pie chart, weekly bars and your biggest expense at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Dashboard() {
  const { expenses, hydrated } = useExpenses();

  const byCategory = CATEGORIES.map((c) => ({
    name: c.label,
    token: c.token,
    value: expenses
      .filter((e) => e.category === c.id)
      .reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0);

  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = d.getTime() + 86400000;
    return {
      day: dayLabels[d.getDay()],
      total: expenses
        .filter((e) => e.createdAt >= d.getTime() && e.createdAt < next)
        .reduce((s, e) => s + e.amount, 0),
    };
  });

  const biggest = expenses.reduce<null | (typeof expenses)[number]>(
    (max, e) => (!max || e.amount > max.amount ? e : max),
    null,
  );
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (hydrated && expenses.length === 0) {
    return (
      <AppShell>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Log a few expenses on the Home tab and your charts will show up here.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Total tracked so far: <span className="font-medium text-foreground">{formatINR(total)}</span>
      </p>

      {biggest && (
        <section className="mt-6 rounded-2xl border border-accent/40 bg-accent/15 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground/70">
            Biggest expense
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-bold">{biggest.note}</p>
              <div className="mt-2">
                <CategoryChip category={biggest.category} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold">{formatINR(biggest.amount)}</p>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          By category
        </h2>
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
          <div className="h-56 w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="none"
                >
                  {byCategory.map((d) => (
                    <Cell key={d.name} fill={`var(--${d.token})`} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full space-y-2 sm:w-1/2">
            {byCategory.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: `var(--${d.token})` }}
                />
                <span className="flex-1 text-muted-foreground">{d.name}</span>
                <span className="font-medium">{formatINR(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Last 7 days
        </h2>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(v: number) => formatINR(v)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Top category:{" "}
        {byCategory.length
          ? categoryById(
              CATEGORIES.find(
                (c) => c.label === [...byCategory].sort((a, b) => b.value - a.value)[0].name,
              )!.id,
            ).label
          : "—"}
      </p>
    </AppShell>
  );
}
