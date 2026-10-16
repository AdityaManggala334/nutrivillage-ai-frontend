"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExploreFormData } from "@/schemas/explore";

/**
 * E1 — payload hasil Explore disimpan di `localStorage` sehingga hasil tetap
 * muncul saat pengguna kembali dari halaman detail resep atau me-refresh
 * halaman.
 *
 * Yang disimpan hanya *parameter* (payload); hasil rekomendasi tetap Server
 * State (TanStack Query) dan diambil ulang sesuai cache-nya.
 *
 * `skipHydration: true` dipakai agar render pertama di peramban sama dengan
 * HTML hasil SSR (menghindari hydration mismatch Next.js). Komponen pemakai
 * wajib memanggil `useExploreHydration()`.
 */
export interface ExploreState {
  /** Payload terakhir alur masyarakat (halaman Explore). */
  payload: ExploreFormData | null;
  /** Payload terakhir alur Petugas SPPG. */
  sppgPayload: ExploreFormData | null;

  setPayload: (payload: ExploreFormData | null) => void;
  setSppgPayload: (payload: ExploreFormData | null) => void;
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set) => ({
      payload: null,
      sppgPayload: null,
      setPayload: (payload) => set({ payload }),
      setSppgPayload: (sppgPayload) => set({ sppgPayload }),
    }),
    {
      name: "nutrivillage-explore",
      version: 1,
      partialize: (state) => ({
        payload: state.payload,
        sppgPayload: state.sppgPayload,
      }),
      skipHydration: true,
    },
  ),
);

/** Baca payload tersimpan (dipanggil setelah hidrasi, mis. untuk prefill form). */
export const selectPayload = (state: ExploreState): ExploreFormData | null => state.payload;
export const selectSppgPayload = (state: ExploreState): ExploreFormData | null =>
  state.sppgPayload;

/** Hidrasi dari `localStorage` — aman dipanggil berulang pada tiap komponen. */
export function useExploreHydration(): void {
  useEffect(() => {
    void useExploreStore.persist.rehydrate();
  }, []);
}
