import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useExpenses } from "@/hooks/use-expenses";
import { formatINR } from "@/lib/expenses";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Monthly Insights — PaisaWise" },
      {
        name: "description",
        content:
          "AI-powered monthly money tips for students, built on your own spending history. Coming soon to PaisaWise.",
      },
      { property: "og:title", content: "Monthly Insights — PaisaWise" },
      {
        property: "og:description",
        content: "Personalised monthly saving tips based on your tracked expenses.",
      },
    ],
  }),
  component: Insights,
});

const previews = [
  {
    title: "Where your month leaks",
    body: "A plain-language breakdown of the one category quietly eating your budget.",
  },
  {
    title: "One habit to change",
    body: "A single, doable swap for next month — not a lecture about skipping chai.",
  },
  {
    title: "Realistic saving target",
    body: "A rupee goal based on what you actually spend, not a generic 20% rule.",
  },
];

function Insights() {
  const { expenses } = useExpenses();
  const now = new Date();
  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Insights</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This month you've tracked{" "}
        <span className="font-medium text-foreground">{formatINR(monthTotal)}</span>.
      </p>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-secondary/60 px-5 py-4">
          <p className="inline-flex items-center gap-2 font-display font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI monthly tips
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coming soon — your expenses stay on this device until you turn it on.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {previews.map((p) => (
            <li key={p.title} className="flex items-start gap-3 px-5 py-4">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4">
          <button
            disabled
            className="w-full rounded-xl bg-primary/40 px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Generate my tips (soon)
          </button>
        </div>
      </section>
    </AppShell>
  );
}
