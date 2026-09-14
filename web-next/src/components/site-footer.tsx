/** Footer ringkas untuk halaman auth & onboarding (sama seperti shell Modul 1-4). */
export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="app-container flex flex-col items-center justify-between gap-2 py-6 text-sm text-stone-500 sm:flex-row">
        <p>NutriVillage AI — Rekomendasi menu bergizi berbasis pangan lokal Madiun.</p>
        <p className="text-xs">Estimasi harga dapat berbeda dengan harga pasar aktual.</p>
      </div>
    </footer>
  );
}
