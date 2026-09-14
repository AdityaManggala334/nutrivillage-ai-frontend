import { NextResponse } from "next/server";
import { ExploreFormSchema } from "@/schemas/explore";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { generateRecommendations } from "@/server/data";
import { parseJsonBody } from "@/server/http";
import { consumeGenerateQuota } from "@/server/rate-limit";

/**
 * POST /api/recommendations — FR-09, FR-10, dan FR-35.
 * Body divalidasi ExploreFormSchema; generate dibatasi 5x/jam per akun.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, ExploreFormSchema);
  if (!parsed.ok) return parsed.response;

  // FR-35: rate limiting per sesi (user) atau per alamat IP untuk tamu.
  const user = getUserByToken(getSessionToken(request));
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const quotaKey = user ? `user:${user.id}` : `ip:${forwarded ?? "lokal"}`;
  const quota = consumeGenerateQuota(quotaKey);

  if (!quota.allowed) {
    const resetMinutes = Math.max(1, Math.ceil((quota.resetAt - Date.now()) / 60000));
    return NextResponse.json(
      {
        message: `Batas Generate Explore tercapai (maksimal ${quota.limit} kali per jam). Coba lagi dalam ${resetMinutes} menit.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(quota.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const recommendations = await generateRecommendations(parsed.data);
  return NextResponse.json(recommendations, {
    headers: {
      "X-RateLimit-Limit": String(quota.limit),
      "X-RateLimit-Remaining": String(quota.remaining),
    },
  });
}
