import { THEME_STORAGE_KEY } from "@/lib/constants";

/**
 * Script anti-flash (FOUC): menerapkan tema tersimpan sebelum React hydrate
 * sehingga tidak ada kedipan terang saat halaman dimuat dalam mode gelap.
 * React Server Component (dirender di server, tanpa JS bundle klien).
 */
export function ThemeScript() {
  const script = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var d=s==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
