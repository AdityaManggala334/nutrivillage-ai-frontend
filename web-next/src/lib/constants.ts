import type {
  AgeGroup,
  DayOfWeek,
  MealSlot,
  RecommendationGoal,
} from "@/schemas/domain";

export const AGE_GROUP_ORDER: readonly AgeGroup[] = [
  "balita",
  "anak",
  "dewasa",
  "lansia",
];

export const AGE_GROUP_LABELS: Readonly<Record<AgeGroup, string>> = {
  balita: "Balita (1-3 th)",
  anak: "Anak (4-12 th)",
  dewasa: "Dewasa (13-59 th)",
  lansia: "Lansia (60+ th)",
};

export const AGE_GROUP_SHORT: Readonly<Record<AgeGroup, string>> = {
  balita: "Balita",
  anak: "Anak",
  dewasa: "Dewasa",
  lansia: "Lansia",
};

export const MEAL_SLOTS: readonly MealSlot[] = [
  "sarapan",
  "makan-siang",
  "makan-malam",
];

export const MEAL_SLOT_LABELS: Readonly<Record<MealSlot, string>> = {
  sarapan: "Sarapan",
  "makan-siang": "Makan Siang",
  "makan-malam": "Makan Malam",
};

export const MEAL_SLOT_ICONS: Readonly<Record<MealSlot, string>> = {
  sarapan: "☀️",
  "makan-siang": "🍛",
  "makan-malam": "🌙",
};

export const DAYS: readonly DayOfWeek[] = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
];

export const DAY_LABELS: Readonly<Record<DayOfWeek, string>> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

export const GOAL_LABELS: Readonly<Record<RecommendationGoal, string>> = {
  hemat: "Hemat anggaran",
  seimbang: "Gizi seimbang",
  "tinggi-protein": "Tinggi protein",
  "rendah-lemak": "Rendah lemak",
};

export const GOAL_DESCRIPTIONS: Readonly<Record<RecommendationGoal, string>> = {
  hemat: "Prioritaskan menu dengan biaya paling efisien.",
  seimbang: "Kombinasi nutrisi, biaya, dan pangan lokal yang seimbang.",
  "tinggi-protein": "Utamakan lauk berprotein tinggi untuk pertumbuhan.",
  "rendah-lemak": "Kurangi asupan lemak, perbanyak sayur & kukus.",
};

export const DEFAULT_WEEK_ID = "pekan-ini";

export const SESSION_COOKIE = "nutrivillage_session";
export const THEME_STORAGE_KEY = "nutrivillage-theme";
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/explore",
  "/history",
  "/favorites",
  "/meal-planner",
  "/shopping-list",
  "/onboarding",
] as const;
