import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EXPENSE_PARSER_PROMPT, INSIGHTS_PROMPT } from "./ai-prompts";
import { chat, stripFences } from "./ai.server";

export interface ParsedExpense {
  amount: number | null;
  category: string;
  merchant: string | null;
  note: string | null;
}

export const parseExpenseWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<ParsedExpense> => {
    const raw = await chat([
      { role: "system", content: EXPENSE_PARSER_PROMPT },
      { role: "user", content: data.text },
    ]);
    try {
      const parsed = JSON.parse(stripFences(raw)) as ParsedExpense;
      return {
        amount: typeof parsed.amount === "number" ? parsed.amount : null,
        category: typeof parsed.category === "string" ? parsed.category : "Other",
        merchant: typeof parsed.merchant === "string" ? parsed.merchant : null,
        note: typeof parsed.note === "string" ? parsed.note : null,
      };
    } catch {
      return { amount: null, category: "Other", merchant: null, note: null };
    }
  });

export const generateMonthlyInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        expenses: z.array(
          z.object({
            note: z.string(),
            amount: z.number(),
            category: z.string(),
            date: z.string(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (data.expenses.length === 0) {
      return { text: "" };
    }
    const lines = data.expenses
      .map((e) => `${e.date} | ${e.note} | ${e.category} | INR ${e.amount}`)
      .join("\n");
    const text = await chat([
      {
        role: "system",
        content:
          "You are a friendly money coach for Indian college students. Reply in short markdown with clear headings and bullet points. Use ₹ for amounts. Be specific and practical, never preachy.",
      },
      { role: "user", content: `${INSIGHTS_PROMPT}\n\nExpenses (date | note | category | amount):\n${lines}` },
    ]);
    return { text };
  });
