import { categoryById, type CategoryId } from "@/lib/expenses";

export function CategoryChip({
  category,
  className = "",
}: {
  category: CategoryId;
  className?: string;
}) {
  const cat = categoryById(category);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `color-mix(in oklab, var(--${cat.token}) 16%, transparent)`,
        color: `color-mix(in oklab, var(--${cat.token}) 78%, black)`,
      }}
    >
      <span aria-hidden>{cat.emoji}</span>
      {cat.label}
    </span>
  );
}
