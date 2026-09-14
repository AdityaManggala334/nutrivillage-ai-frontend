"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Modul 7: konfigurasi cache global — staleTime 5 menit, gcTime 15 menit.
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * Modul 7: satu-satunya Client Component tingkat atas. Membungkus aplikasi
 * dengan TanStack Query Provider dan menyinkronkan tema Zustand ke <html>.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [isHydrated, setIsHydrated] = useState(false);
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  // Baca preferensi tersimpan sekali setelah mount (hindari mismatch SSR).
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setThemeMode(stored);
    }
    setIsHydrated(true);
  }, [setThemeMode]);

  // Terapkan ke <html> dan simpan (hanya setelah nilai awal terbaca).
  useEffect(() => {
    const root = document.documentElement;
    const isDark = themeMode === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    if (isHydrated) {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    }
  }, [themeMode, isHydrated]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
