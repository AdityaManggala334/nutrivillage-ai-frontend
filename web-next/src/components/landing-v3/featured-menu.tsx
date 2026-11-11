import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/* Foto = contoh visual hidangan sejenis. Angka = estimasi dari data aplikasi. */
const MENUS = [
  {
    name: "Pepes Ikan & Sayuran",
    image: "/assets/menu/menu-nasi-tempe-sayur-lokal.webp",
    alt: "Hidangan ikan pepes dengan sayuran khas Indonesia",
    nutrition: "Estimasi ±380 kkal",
    cost: "Estimasi Rp 15.000 / porsi",
    local: "Ikan sungai & rempah lokal sesuai musim",
    tall: true,
  },
  {
    name: "Nasi Pecel Gaya Madiun",
    image: "/assets/menu/menu-salad-bowl-sehat.webp",
    alt: "Semangkuk salad sehat dengan sayuran segar dan telur",
    nutrition: "Estimasi ±520 kkal",
    cost: "Estimasi Rp 12.000 / porsi",
    local: "Kacang tanah & sayuran daun lokal Madiun",
    tall: false,
  },
  {
    name: "Menu Lauk Pauk Seimbang",
    image: "/assets/hero/hero-pangan-lokal-meja-hijau.webp",
    alt: "Hidangan lengkap Indonesia dengan lauk, sayur, dan karbohidrat",
    nutrition: "Estimasi ±610 kkal",
    cost: "Estimasi Rp 16.000 / porsi",
    local: "Ikan & sayuran pasar lokal musiman",
    tall: false,
  },
] as const;

/** Deretan kartu menu overlap gaya Nepal: tengah paling besar & naik. */
export function V3FeaturedMenu() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="landing-eyebrow">Rekomendasi Menu</p>
          <h2 id="menu-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Inspirasi Menu Bergizi dari Pangan Lokal
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-cream/70">
            Temukan inspirasi hidangan yang mempertimbangkan kebutuhan nutrisi, anggaran,
            dan ketersediaan bahan pangan lokal.
          </p>
        </Reveal>

        <div className="grid items-start gap-6 sm:grid-cols-3 lg:gap-8">
          {MENUS.map((menu, index) => (
            <Reveal
              key={menu.name}
              delay={index * 120}
              direction={index === 1 ? "up" : "scale"}
              className={index === 1 ? "sm:-mt-10" : ""}
            >
              <article
                className={`lift group relative overflow-hidden rounded-3xl ${
                  index === 1 ? "min-h-[30rem] ring-1 ring-gold/40" : "min-h-[24rem]"
                }`}
              >
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
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-semibold text-cream sm:text-2xl">{menu.name}</h3>
                  <p className="mt-2 font-body text-sm font-medium text-gold">{menu.nutrition}</p>
                  <p className="mt-1 font-body text-sm text-cream/80">{menu.cost}</p>
                  <p className="mt-3 font-body text-xs leading-relaxed text-cream/60">{menu.local}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a href="/katalog" className="landing-btn landing-btn-solid">
            Lihat Semua Menu <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>

        <p className="mt-8 text-center font-body text-xs leading-relaxed text-cream/50">
          Foto merupakan contoh visual hidangan sejenis. Angka gizi dan harga bersifat
          estimasi berbasis data yang tersedia dan terverifikasi admin, bukan diagnosis
          medis atau harga pasar real-time.
        </p>
      </div>
    </section>
  );
}
