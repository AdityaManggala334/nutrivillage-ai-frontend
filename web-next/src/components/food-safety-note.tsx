import { ShieldCheck } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { listVerifiedFoodSafety } from "@/server/market-api";
import type { FoodSafetyInfo } from "@/schemas/admin";
import type { Recipe } from "@/schemas/domain";

/**
 * Informasi keamanan pangan terverifikasi yang relevan dengan resep.
 * Menggantikan kebutuhan fitur pemindaian bahan; bukan hasil deteksi kamera.
 */
export async function FoodSafetyNote({ recipe }: { recipe: Recipe }) {
  // Hanya entri yang sudah diverifikasi admin yang layak ditampilkan sebagai fakta.
  let verified: FoodSafetyInfo[] = [];
  try {
    verified = await listVerifiedFoodSafety();
  } catch (error) {
    // Sengaja diam: kartu saran keamanan bersifat pelengkap.
    console.error("[food-safety] gagal memuat:", error);
    return null;
  }

  const ingredientNames = recipe.ingredients.map((ingredient) => ingredient.name.toLowerCase());
  const matches = verified.filter((item) => {
    const topic = item.topic.toLowerCase();
    const keyword = topic.split(" ")[0] ?? topic;
    return ingredientNames.some(
      (name) => name.includes(keyword) || topic.includes(name),
    );
  });

  const items = matches.length > 0 ? matches : verified.slice(0, 2);
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
          <CardTitle>Keamanan Pangan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {item.topic}
              </span>
              <Badge tone="outline">{item.riskType}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {item.handling}
            </p>
            <p className="text-xs text-stone-400">Sumber: {item.source}</p>
          </div>
        ))}
        <p className="text-xs text-stone-400">
          Bersifat edukatif dan telah diverifikasi admin — bukan hasil pemindaian otomatis.
        </p>
      </CardContent>
    </Card>
  );
}
