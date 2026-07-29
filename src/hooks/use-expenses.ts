import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_KEY,
  detectCategory,
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

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setExpenses(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  const addFromText = useCallback((input: string) => {
    const parsed = parseExpense(input);
    if (!parsed) return false;
    const expense: Expense = {
      id: crypto.randomUUID(),
      note: parsed.note,
      amount: parsed.amount,
      category: detectCategory(input),
      createdAt: Date.now(),
    };
    setExpenses((prev) => [expense, ...prev]);
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setCategory = useCallback((id: string, category: CategoryId) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, category } : e)));
  }, []);

  return { expenses, hydrated, addFromText, remove, setCategory };
}
