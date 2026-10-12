"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook IntersectionObserver untuk animasi scroll-reveal (tanpa dependensi
 * eksternal). Mengembalikan `ref` yang dipasang ke elemen target dan `inView`
 * yang menjadi `true` saat elemen masuk viewport.
 */
export interface UseInViewOptions {
  /** Margin root; nilai negatif bawah menunda reveal sampai sedikit masuk layar. */
  readonly rootMargin?: string;
  /** Berapa persen elemen harus terlihat sebelum dianggap masuk. */
  readonly threshold?: number;
  /** Bila true (default), reveal hanya sekali lalu berhenti diamati. */
  readonly once?: boolean;
}

export interface UseInViewResult<T extends HTMLElement> {
  readonly ref: React.RefObject<T | null>;
  readonly inView: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.15,
  once = true,
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback: lingkungan tanpa IntersectionObserver tetap menampilkan konten.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}
