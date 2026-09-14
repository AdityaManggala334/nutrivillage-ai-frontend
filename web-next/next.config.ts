import type { NextConfig } from "next";

const projectRoot = import.meta.dirname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Modul 6: akar workspace eksplisit (menghindari ambiguitas lockfile).
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  // Modul 5: React 19 + React Compiler (auto-memoization, tanpa useMemo/useCallback manual).
  // Modul 6: optimizePackageImports menekan bundle size (Core Web Vitals / INP).
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  // Modul 6: optimasi format gambar modern.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
