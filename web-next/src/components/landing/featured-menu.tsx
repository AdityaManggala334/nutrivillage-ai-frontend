import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const MENUS = [
  {
    name: "Nasi Pecel Gaya Madiun",
    image: "/assets/menu/menu-nasi-tempe-sayur-lokal.webp",
    alt: "Piring nasi dengan tempe, sayur braun, dan lauk pauk khas Indonesia",
    nutrition: "±520 kkal • Protein 24 g • Serat 8 g",
    cost: "Rp 12.000 / porsi",
    local: "Kacang tanah, sayuran daun & tempe — komoditas lokal Madiun",
  },
  {
    name: "Salad Bowl Sayur Musiman",
    image: "/assets/menu/menu-salad-bowl-sehat.webp",
    alt: "Mangkuk salad sehat berisi sayuran segar, telur, dan potongan buah",
    nutrition: "±380 kkal • Protein 18 g • Serat 9 g",
    cost: "Rp 14.500 / porsi",
    local: "Sayuran dataran tinggi sesuai musim tanam lokal",
  },
  {
    name: "Menu Lauk Pauk Seimbang",
    image: "/assets/hero/hero-pangan-lokal-meja-hijau.webp",
    alt: "Hidangan lengkap Indonesia dengan lauk, sayur, dan karbohidrat di atas meja hijau",
    nutrition: "±610 kkal • Protein 30 g • Serat 7 g",
    cost: "Rp 16.000 / porsi",
    local: "Ikan & sayuran pasar lokal sesuai ketersediaan musiman",
  },
] as const;

/** Menu unggulan: komposisi editorial asimetris (1 besar + 2 kecil). */
export function FeaturedMenu() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <Reveal className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="landing-eyebrow">Rekomendasi Menu</p>
            <h2 id="menu-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Menu Bergizi dari Bahan Lokal
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-cream/70">
              Setiap rekomendasi menyertakan informasi gizi, estimasi biaya, dan asal bahan
              pangan lokal. Peringkat disusun mesin rekomendasi, bukan pilihan manual.
            </p>
          </div>
          <a
            href="/katalog"
            className="inline-flex shrink-0 items-center gap-2 font-body text-sm font-semibold text-gold transition-colors hover:text-cream"
          >
            Lihat Katalog Menu <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kartu pertama besar */}
          <Reveal>
            <article className="lift group relative h-full min-h-[26rem] overflow-hidden rounded-3xl">
              <img
                src={MENUS[0].image}
                alt={MENUS[0].alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/30 to-transparent"
              />
              <MenuInfo menu={MENUS[0]} />
            </article>
          </Reveal>

          {/* Dua kartu bertumpuk */}
          <div className="grid gap-6">
            {MENUS.slice(1).map((menu) => (
              <Reveal key={menu.name} delay={120}>
                <article className="lift group relative min-h-[19.5rem] overflow-hidden rounded-3xl">
                  <img
                    src={menu.image}
                    alt={menu.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-forest-deep/95 via-forest-deep/30 to-transparent"
                  />
                  <MenuInfo menu={menu} />
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <p className="mt-6 font-body text-xs leading-relaxed text-cream/50">
          Angka gizi dan harga bersifat estimasi berbasis data yang tersedia, bukan diagnosis
          medis atau harga pasar real-time.
        </p>
      </div>
    </section>
  );
}

function MenuInfo({ menu }: { readonly menu: (typeof MENUS)[number] }) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
      <h3 className="text-2xl font-semibold text-cream sm:text-3xl">{menu.name}</h3>
      <p className="mt-2 font-body text-sm font-medium text-gold">{menu.nutrition}</p>
      <p className="mt-1 font-body text-sm text-cream/80">{menu.cost}</p>
      <p className="mt-3 font-body text-xs leading-relaxed text-cream/60">{menu.local}</p>
    </div>
  );
}
