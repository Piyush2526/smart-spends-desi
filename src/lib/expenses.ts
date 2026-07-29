export type CategoryId =
  | "food"
  | "travel"
  | "study"
  | "fun"
  | "rent"
  | "shopping"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** tailwind token suffix, e.g. cat-food */
  token: string;
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food",
    emoji: "🍜",
    token: "cat-food",
    keywords: [
      "chai","tea","coffee","canteen","mess","food","lunch","dinner","breakfast","snack",
      "samosa","maggi","pizza","burger","swiggy","zomato","dosa","biryani","juice","water",
      "restaurant","cafe","milk","eat",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "🛺",
    token: "cat-travel",
    keywords: [
      "auto","bus","metro","train","ticket","uber","ola","rapido","cab","petrol","fuel",
      "travel","taxi","toll","parking","cycle","flight",
    ],
  },
  {
    id: "study",
    label: "Study",
    emoji: "📚",
    token: "cat-study",
    keywords: [
      "book","books","notes","xerox","photocopy","print","printout","stationery","pen","exam",
      "fee","fees","course","tuition","lab","college","udemy","coaching",
    ],
  },
  {
    id: "fun",
    label: "Fun",
    emoji: "🎬",
    token: "cat-fun",
    keywords: [
      "movie","netflix","spotify","game","games","party","outing","concert","subscription",
      "hotstar","prime","fun","trip","cricket",
    ],
  },
  {
    id: "rent",
    label: "Rent & Bills",
    emoji: "🏠",
    token: "cat-rent",
    keywords: [
      "rent","hostel","pg","electricity","bill","wifi","internet","recharge","mobile","laundry",
      "maid","gas","water bill",
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    emoji: "🛍️",
    token: "cat-shopping",
    keywords: [
      "shirt","clothes","shoes","amazon","flipkart","myntra","shopping","bag","headphones",
      "phone","charger","gift","haircut","medicine","salon",
    ],
  },
  { id: "other", label: "Other", emoji: "✨", token: "cat-other", keywords: [] },
];

export const categoryById = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export interface Expense {
  id: string;
  note: string;
  amount: number;
  category: CategoryId;
  createdAt: number;
}

export function detectCategory(text: string): CategoryId {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => words.includes(k))) return cat.id;
  }
  return "other";
}

/** Pulls the first number out of the text and uses the rest as the note. */
export function parseExpense(input: string): { note: string; amount: number } | null {
  const match = input.match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const note =
    input
      .replace(match[0], " ")
      .replace(/(?:rs\.?|inr|₹|rupees|for|spent|on)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim() || "Expense";
  return { note: note.charAt(0).toUpperCase() + note.slice(1), amount };
}

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: n % 1 === 0 ? 0 : 2 });

export const isSameDay = (a: number, b: number) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const STORAGE_KEY = "paisawise.expenses.v1";
