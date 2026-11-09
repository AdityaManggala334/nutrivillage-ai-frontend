"use client";

import { useIsFetching } from "@tanstack/react-query";
import { ExploreForm } from "@/components/explore-form";
import { ExploreLockedPanel } from "@/components/explore-locked-panel";
import { RecommendationResults } from "@/components/recommendation-results";
import { useSession } from "@/hooks/use-session";
import { queryKeys } from "@/lib/query-keys";
import { useExploreHydration, useExploreStore } from "@/stores/explore-store";

/**
 * Komponen klien tipis untuk halaman Explore. Memisahkan form (Client UI State
 * lokal) dari hasil (Server State TanStack Query).
 *
 * E1: payload terakhir dipersist lewat Zustand sehingga hasil tetap muncul
 * saat kembali dari halaman detail resep / reload.
 *
 * B7 (FR-01 revisi): tamu melihat panel terkunci, bukan form. Explore tetap
 * dibuka supaya tamu paham apa yang akan didapat setelah daftar.
 */
export function ExploreClient() {
  useExploreHydration();
  const { data: user, isPending } = useSession();
  const tamu = !isPending && (!user || user.role === "guest");
  const payload = useExploreStore((state) => state.payload);
  const setPayload = useExploreStore((state) => state.setPayload);
  const fetchingCount = useIsFetching({ queryKey: queryKeys.recommendations.all });

  if (tamu) {
    return <ExploreLockedPanel />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="glass h-fit rounded-2xl p-5">
        <ExploreForm onGenerate={setPayload} isLoading={payload !== null && fetchingCount > 0} />
      </div>
      <div className="min-w-0">
        <RecommendationResults payload={payload} showSaveAction />
      </div>
    </div>
  );
}
