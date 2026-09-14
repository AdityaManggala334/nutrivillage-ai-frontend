import type { HistoryFilter } from "@/schemas/domain";

/**
 * Modul 7: struktur queryKey terpusat. Selalu gunakan factory ini agar
 * invalidasi cache konsisten dan tidak terjadi typo string key.
 */
export const queryKeys = {
  recipes: {
    all: ["recipes"] as const,
    list: () => ["recipes", "list"] as const,
    detail: (id: string) => ["recipes", "detail", id] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: () => ["profile", "detail"] as const,
  },
  session: {
    all: ["session"] as const,
    detail: () => ["session", "detail"] as const,
  },
  recommendations: {
    all: ["recommendations"] as const,
    byHash: (hash: string) => ["recommendations", hash] as const,
  },
  history: {
    all: ["history"] as const,
    list: (filter: HistoryFilter) => ["history", "list", filter] as const,
  },
  mealPlans: {
    all: ["meal-plans"] as const,
    detail: (weekId: string) => ["meal-plans", weekId] as const,
  },
  shoppingList: {
    all: ["shopping-list"] as const,
    byWeek: (weekId: string) => ["shopping-list", weekId] as const,
  },
} as const;
