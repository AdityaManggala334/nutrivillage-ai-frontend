"use client";

import {
  ArrowRight,
  Calendar,
  Compass,
  Heart,
  History,
  Leaf,
  ShoppingCart,
  Sprout,
  Apple,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { Badge, Button, ButtonLink, RecipeCardSkeleton } from "@/components/ui";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { formatRupiah } from "@/lib/utils";
import type { AgeCounts, ExploreFormData } from "@/schemas/explore";
import type { FamilyProfile } from "@/schemas/profile";
import type { Recommendation } from "@/schemas/domain";

const countByAgeGroup = (profile: FamilyProfile): AgeCounts => {
  const counts: AgeCounts = { balita: 0, anak: 0, dewasa: 0, lansia: 0 };
  for (const member of profile.members) {
    counts[member.ageGroup] += 1;
  }
  return counts;
};

const toPayload = (profile: FamilyProfile): ExploreFormData => ({
  dailyBudget: profile.dailyBudget,
  days: 3,
  goal: "seimbang",
  members: countByAgeGroup(profile),
  preferences: profile.preferences,
  allergies: profile.avoidedIngredients,
  location: profile.region,
});

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { recipe, scores } = recommendation;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-brand-300 hover:shadow-sm">
      <div className="relative flex h-40 items-center justify-center border-b border-stone-100 bg-brand-50">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
          <Leaf className="size-8" aria-hidden="true" />
        </span>
        <span className="absolute top-4 left-4 rounded-full border border-brand-200 bg-white px-3 py-1 text-[11px] font-semibold text-brand-700">
          {recipe.category}
        </span>
        <span
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white tabular-nums"
          aria-label={`Skor ${scores.total} dari 100`}
        >
          {scores.total}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-stone-900">{recipe.name}</h3>
        <p className="mt-1 text-xs text-stone-400">{recipe.servings} porsi</p>
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">
          {recipe.description}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-stone-100 overflow-hidden rounded-xl border border-stone-100">
          {[
            { label: "Kalori", value: `${recipe.nutrition.calories}` },
            { label: "Protein", value: `${recipe.nutrition.protein} g` },
            { label: "Serat", value: `${recipe.nutrition.fiber} g` },
          ].map((item) => (
            <div key={item.label} className="p-2 text-center">
              <p className="text-[10px] text-stone-400">{item.label}</p>
              <p className="mt-0.5 text-xs font-bold text-stone-800 tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-stone-100 pt-4">
          <div>
            <p className="text-[10px] text-stone-400">Estimasi biaya</p>
            <p className="mt-0.5 text-sm font-bold text-brand-700 tabular-nums">
              {formatRupiah(recipe.estimatedCost)}
            </p>
          </div>
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-brand-700"
          >
            Lihat detail
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Compass;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-brand-200 hover:bg-brand-50/40 dark:hover:border-brand-800 dark:hover:bg-brand-950/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="size-[19px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-800">{title}</span>
        <span className="mt-0.5 block text-[11px] text-stone-400">{description}</span>
      </span>
      <ArrowRight
        className="size-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
        aria-hidden="true"
      />
    </Link>
  );
}

/** FR-07: halaman utama dashboard. */
export function DashboardHome() {
  const { data: user } = useSession();
  const profileQuery = useProfile();
  const profile = profileQuery.data ?? null;
  const payload = profile ? toPayload(profile) : null;
  const recommendations = useRecommendations(payload);

  const userName = user?.name ?? "Keluarga";

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <section>
        <p className="text-xs font-medium text-brand-700">Selamat datang kembali</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="dashboard-title" className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
              Halo, {userName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
              Temukan pilihan makanan yang sesuai kebutuhan keluarga dan budget harianmu.
            </p>
          </div>
          <div className="hidden md:block">
            <Badge tone="brand" className="px-2.5 py-1 text-xs">
              Pangan Lokal Madiun
            </Badge>
          </div>
        </div>
      </section>

      {/* Profile summary */}
      {profileQuery.isPending ? (
        <div className="h-32 animate-pulse rounded-2xl border border-stone-200 bg-white" />
      ) : !profile ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Profil keluarga belum lengkap
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            Lengkapi data keluarga agar rekomendasi menu dapat disesuaikan dengan kebutuhanmu.
          </p>
          <div className="mt-4">
            <ButtonLink href="/onboarding">Lengkapi Profil</ButtonLink>
          </div>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-start justify-between gap-5 border-b border-stone-100 p-5 md:p-6">
            <div>
              <div className="flex items-center gap-2">
                <User className="size-[18px] text-brand-600" aria-hidden="true" />
                <h2 className="text-base font-bold text-stone-900">Profil Keluarga</h2>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
                Data keluarga digunakan sebagai dasar penyusunan rekomendasi menu.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="hidden items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 sm:flex"
            >
              Lihat detail
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3">
            <div className="border-b border-stone-100 p-5 sm:border-r sm:border-b-0">
              <p className="text-[11px] font-medium text-stone-400">Anggota keluarga</p>
              <p className="mt-1 text-xl font-bold text-stone-900">{profile.members.length} orang</p>
              <p className="mt-1 truncate text-xs text-stone-500">
                {profile.members
                  .slice(0, 3)
                  .map((member) => member.name)
                  .join(", ")}
                {profile.members.length > 3 ? ` +${profile.members.length - 3}` : ""}
              </p>
            </div>
            <div className="border-b border-stone-100 p-5 sm:border-r sm:border-b-0">
              <p className="text-[11px] font-medium text-stone-400">Budget harian</p>
              <p className="mt-1 text-xl font-bold text-stone-900">
                {formatRupiah(profile.dailyBudget)}
              </p>
              <p className="mt-1 text-xs text-stone-500">Anggaran keluarga per hari</p>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-medium text-stone-400">Wilayah</p>
              <p className="mt-1 text-xl font-bold text-stone-900">{profile.region}</p>
              <p className="mt-1 text-xs text-stone-500">Fokus pangan lokal Madiun</p>
            </div>
          </div>

          {profile.avoidedIngredients.length > 0 ? (
            <div className="border-t border-stone-100 px-5 py-3 md:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-500">Pantangan:</span>
                {profile.avoidedIngredients.map((item) => (
                  <Badge key={item} tone="danger">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* Two columns */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <section aria-labelledby="recommendation-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-brand-700 uppercase">
                  Untuk keluargamu
                </p>
                <h2 id="recommendation-title" className="mt-1 text-xl font-bold text-stone-900">
                  Rekomendasi Terakhir
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Pilihan berdasarkan profil dan budget keluarga.
                </p>
              </div>
              <Link
                href="/explore"
                className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                Lihat semua
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {!profile ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-stone-800">Belum ada rekomendasi</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
                  Lengkapi profil keluarga terlebih dahulu, lalu buat rekomendasi melalui Explore.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/onboarding">Lengkapi Profil</ButtonLink>
                </div>
              </div>
            ) : recommendations.isPending ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <RecipeCardSkeleton key={index} />
                ))}
              </div>
            ) : recommendations.isError ? (
              <ErrorState
                title="Rekomendasi belum dapat dimuat"
                message={
                  recommendations.error instanceof Error
                    ? recommendations.error.message
                    : "Terjadi kesalahan."
                }
                action={
                  <Button
                    intent="danger"
                    onClick={() => void recommendations.refetch()}
                    loading={recommendations.isFetching}
                  >
                    Coba Lagi
                  </Button>
                }
              />
            ) : (recommendations.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-stone-800">Belum ada rekomendasi</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
                  Coba buat rekomendasi menu melalui Explore berdasarkan kebutuhan keluarga.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/explore">Buka Explore</ButtonLink>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(recommendations.data ?? []).slice(0, 3).map((recommendation) => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="mt-9">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-stone-900">Akses Cepat</h2>
              <p className="mt-1 text-xs text-stone-500">
                Lanjutkan aktivitasmu di NutriVillage AI.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction title="Explore Menu" description="Buat rekomendasi baru" href="/explore" icon={Compass} />
              <QuickAction title="Meal Planner" description="Atur menu selama 7 hari" href="/meal-planner" icon={Calendar} />
              <QuickAction title="Daftar Belanja" description="Kelola bahan yang akan dibeli" href="/shopping-list" icon={ShoppingCart} />
              <QuickAction title="Riwayat" description="Lihat rekomendasi sebelumnya" href="/history" icon={History} />
              <QuickAction title="Menu Favorit" description="Menu yang kamu tandai favorit" href="/favorites" icon={Heart} />
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-stone-400">Budget Harian</p>
                <p className="mt-1 text-xl font-bold text-stone-900">
                  {profile ? formatRupiah(profile.dailyBudget) : "—"}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white" aria-hidden="true">
                <Wallet className="size-[18px]" />
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-[62%] rounded-full bg-brand-500" />
            </div>
            <p className="mt-2 text-[10px] text-stone-400">
              Estimasi budget berdasarkan profil keluarga
            </p>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="size-[18px] text-brand-700" aria-hidden="true" />
                <h2 className="text-sm font-bold text-stone-900">Pangan Lokal</h2>
              </div>
              <Link href="/explore" className="text-[11px] font-semibold text-brand-700">
                Lihat semua
              </Link>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              Bahan yang sedang tersedia di wilayah Madiun.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { name: "Bayam", Icon: Sprout },
                { name: "Kangkung", Icon: Leaf },
                { name: "Tomat", Icon: Apple },
              ].map(({ name, Icon }) => (
                <div key={name}>
                  <div className="flex h-20 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-stone-700">{name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-brand-800 p-5 text-white">
            <p className="text-[10px] font-semibold tracking-wider text-brand-200 uppercase">
              Tips hari ini
            </p>
            <p className="mt-3 text-sm leading-relaxed font-medium">
              Kombinasikan bahan lokal dengan sumber protein agar menu tetap sederhana, terjangkau,
              dan bergizi.
            </p>
            <div className="mt-5 flex justify-end text-brand-300">
              <Leaf className="size-7" aria-hidden="true" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
