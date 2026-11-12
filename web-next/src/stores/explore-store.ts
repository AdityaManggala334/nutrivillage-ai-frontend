"use client";

import { create } from "zustand";
import type { ExploreFormData } from "@/schemas/explore";

/**
 * Payload Explore hanya hidup selama sesi peramban (in-memory), tidak
 * dipulihkan dari `localStorage`. Tanpa ini, membuka halaman Explore langsung
 * memicu rekomendasi dari payload lama, padahal pengguna harus menekan
 * Generate sendiri.
 *
 * Navigasi ke detail resep lalu kembali tetap mempertahankan hasil karena
 * store tidak di-reset; hanya reload halaman yang mengosongkannya.
 */
export interface ExploreState {
  /** Payload terakhir alur masyarakat (halaman Explore). */
  payload: ExploreFormData | null;
  /** Payload terakhir alur Petugas SPPG. */
  sppgPayload: ExploreFormData | null;

  setPayload: (payload: ExploreFormData | null) => void;
  setSppgPayload: (payload: ExploreFormData | null) => void;
}

export const useExploreStore = create<ExploreState>()((set) => ({
  payload: null,
  sppgPayload: null,
  setPayload: (payload) => set({ payload }),
  setSppgPayload: (sppgPayload) => set({ sppgPayload }),
}));

export const selectPayload = (state: ExploreState): ExploreFormData | null => state.payload;
export const selectSppgPayload = (state: ExploreState): ExploreFormData | null =>
  state.sppgPayload;
