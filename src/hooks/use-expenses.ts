import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { parseExpenseWithAI } from "@/lib/ai.functions";
import {
  STORAGE_KEY,
  detectCategory,
  mapAICategory,
  parseExpense,
  type CategoryId,
  type Expense,
} from "@/lib/expenses";

function read(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Expense[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type AddResult = { ok: true } | { ok: false; reason: "no-amount" | "error"; message?: string };

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [parsing, setParsing] = useState(false);
  const parseAI = useServerFn(parseExpenseWithAI);

  useEffect(() => {
    setExpenses(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  const push = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const addFromText = useCallback(
    async (input: string): Promise<AddResult> => {
      const text = input.trim();
      if (!text) return { ok: false, reason: "no-amount" };

      setParsing(true);
      try {
        const ai = await parseAI({ data: { text } });
        if (ai.amount && ai.amount > 0) {
          const note =
            [ai.merchant, ai.note].filter(Boolean).join(" — ") ||
            text.replace(/\d+(\.\d+)?/g, "").trim() ||
            "Expense";
          push({
            id: crypto.randomUUID(),
            note: note.charAt(0).toUpperCase() + note.slice(1),
            amount: ai.amount,
            category: mapAICategory(ai.category),
            merchant: ai.merchant ?? null,
            createdAt: Date.now(),
          });
          return { ok: true };
        }
      } catch (err) {
        // fall through to the offline parser below
        console.error("AI parse failed", err);
      } finally {
        setParsing(false);
      }

      // Fallback: local regex parsing + keyword categories.
      const parsed = parseExpense(text);
      if (!parsed) return { ok: false, reason: "no-amount" };
      push({
        id: crypto.randomUUID(),
        note: parsed.note,
        amount: parsed.amount,
        category: detectCategory(text),
        merchant: null,
        createdAt: Date.now(),
      });
      return { ok: true };
    },
    [parseAI, push],
  );

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setCategory = useCallback((id: string, category: CategoryId) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, category } : e)));
  }, []);

  return { expenses, hydrated, parsing, addFromText, remove, setCategory };
}
