"use client";

import { create } from "zustand";
import type { HistoryFilter } from "@/schemas/domain";

/**
 * Modul 7: Zustand murni untuk Client UI State.
 * Tidak ada data hasil API yang disimpan di sini — semua Server State
 * dikelola TanStack Query.
 */
export interface UIState {
  /** Modul 5/6: drawer/sidebar navigasi. */
  isSidebarOpen: boolean;
  /** Modul 5: tema terang/gelap. */
  themeMode: "light" | "dark";
  /** FR-13: filter tab riwayat (Semua / Favorit / Bulan ini). */
  activeHistoryFilter: HistoryFilter;
  /** FR-13: pencarian lokal pada daftar riwayat. */
  searchQuery: string;
  /** FR-08: apakah panel parameter Explore sedang terbuka di mobile. */
  isExploreFormOpen: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: "light" | "dark") => void;
  setHistoryFilter: (filter: HistoryFilter) => void;
  setSearchQuery: (query: string) => void;
  setExploreFormOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  themeMode: "light",
  activeHistoryFilter: "all",
  searchQuery: "",
  isExploreFormOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleTheme: () =>
    set((state) => ({ themeMode: state.themeMode === "light" ? "dark" : "light" })),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setHistoryFilter: (filter) => set({ activeHistoryFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setExploreFormOpen: (open) => set({ isExploreFormOpen: open }),
}));

/** Selector presisi agar komponen hanya re-render saat slice terkait berubah. */
export const selectIsSidebarOpen = (state: UIState): boolean => state.isSidebarOpen;
export const selectThemeMode = (state: UIState): UIState["themeMode"] => state.themeMode;
