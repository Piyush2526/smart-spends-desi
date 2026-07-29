import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryChip } from "@/components/CategoryChip";
import { useExpenses } from "@/hooks/use-expenses";
import { formatINR, isSameDay } from "@/lib/expenses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaisaWise — Student Expense Tracker in Rupees" },
      {
        name: "description",
        content:
          "Type an expense like 'chai 20' and PaisaWise logs it with a category. Track daily student spending in INR, right on your device.",
      },
      { property: "og:title", content: "PaisaWise — Student Expense Tracker in Rupees" },
      {
        property: "og:description",
        content: "Type an expense like 'chai 20' and PaisaWise logs it with a category. Track daily student spending in INR, right on your device.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { expenses, hydrated, parsing, addFromText, remove } = useExpenses();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const today = expenses.filter((e) => isSameDay(e.createdAt, Date.now()));
  const total = today.reduce((s, e) => s + e.amount, 0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (parsing) return;
    const result = await addFromText(value);
    if (!result.ok) {
      setError(true);
      return;
    }
    setError(false);
    setValue("");
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Kya kharcha hua aaj?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Type it naturally — <span className="text-foreground">“250 zomato dinner with friends”</span>,{" "}
        <span className="text-foreground">“auto 60 rs to college”</span>,{" "}
        <span className="text-foreground">“gpay 120 chai”</span>.
      </p>

      <form onSubmit={submit} className="mt-6">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="type your expense..."
            aria-label="Type your expense"
            disabled={parsing}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={parsing}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            aria-label="Add expense"
          >
            {parsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
        {parsing && (
          <p className="mt-2 text-xs text-muted-foreground">Reading your expense…</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-destructive">
            Couldn’t find an amount — try “samosa 25”.
          </p>
        )}
      </form>


      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Today
        </h2>
        <p className="font-display text-xl font-bold">{formatINR(total)}</p>
      </div>

      <ul className="mt-3 space-y-2">
        {hydrated && today.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing logged yet today. Clean slate!
          </li>
        )}
        {today.map((e) => (
          <li
            key={e.id}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.note}</p>
              <div className="mt-1.5">
                <CategoryChip category={e.category} />
              </div>
            </div>
            <p className="font-display font-semibold">{formatINR(e.amount)}</p>
            <button
              onClick={() => remove(e.id)}
              aria-label={`Delete ${e.note}`}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
