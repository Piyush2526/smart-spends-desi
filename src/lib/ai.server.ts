const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export async function chat(messages: ChatMessage[], model = "google/gemini-3.6-flash") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (res.status === 429) throw new Error("Too many requests — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits to keep using AI.");
  if (!res.ok) throw new Error(`AI request failed (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export function stripFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}
