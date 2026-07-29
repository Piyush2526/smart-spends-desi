import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useExpenses } from "@/hooks/use-expenses";
import { generateMonthlyInsights } from "@/lib/ai.functions";
import { categoryById, formatINR } from "@/lib/expenses";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Monthly Insights — PaisaWise" },
      {
        name: "description",
        content:
          "AI-powered monthly money tips for students, built on your own spending history — top money leaks, saving tips and one habit to change.",
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

/** Minimal markdown-ish renderer for headings, bullets and bold. */
function Rendered({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text
        .split("\n")
        .filter((l) => l.trim())
        .map((line, i) => {
          const l = line.trim();
          if (l.startsWith("#"))
            return (
              <h3 key={i} className="pt-2 font-display text-base font-semibold">
                {inline(l.replace(/^#+\s*/, ""))}
              </h3>
            );
          if (/^([-*•]|\d+\.)\s/.test(l))
            return (
              <p key={i} className="flex gap-2 text-muted-foreground">
                <span className="text-primary">•</span>
                <span>{inline(l.replace(/^([-*•]|\d+\.)\s*/, ""))}</span>
              </p>
            );
          return (
            <p key={i} className="text-muted-foreground">
              {inline(l)}
            </p>
          );
        })}
    </div>
  );
}

function Insights() {
  const { expenses } = useExpenses();
  const run = useServerFn(generateMonthlyInsights);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState("");
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: {
          expenses: monthExpenses.map((e) => ({
            note: e.note,
            amount: e.amount,
            category: categoryById(e.category).label,
            date: new Date(e.createdAt).toISOString().slice(0, 10),
          })),
        },
      });
      setTips(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate tips. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Insights</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This month you've tracked{" "}
        <span className="font-medium text-foreground">{formatINR(monthTotal)}</span> across{" "}
        {monthExpenses.length} {monthExpenses.length === 1 ? "entry" : "entries"}.
      </p>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-secondary/60 px-5 py-4">
          <p className="inline-flex items-center gap-2 font-display font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI monthly tips
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Top 3 money leaks, 3 realistic saving tips and one habit to change.
          </p>
        </div>

        <div className="px-5 py-4">
          {tips ? (
            <Rendered text={tips} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {monthExpenses.length === 0
                ? "Log a few expenses this month and your tips will appear here."
                : "Tap the button below to analyse this month's spending."}
            </p>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={generate}
            disabled={loading || monthExpenses.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Analysing…" : tips ? "Regenerate tips" : "Generate my tips"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
