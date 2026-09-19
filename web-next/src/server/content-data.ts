import "server-only";

import type { Article, Notification } from "@/schemas/content";

/** Konten publik (FR-03) dan notifikasi pengguna (FR-21). */

const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number): string => new Date(Date.now() - n * day).toISOString();

export const ARTICLES: readonly Article[] = [
  {
    id: "artikel-gizi-seimbang",
    title: "Mengenal Gizi Seimbang untuk Keluarga",
    excerpt:
      "Panduan sederhana menyusun porsi makan harian yang seimbang tanpa harus mahal.",
    category: "Gizi Dasar",
    readMinutes: 4,
    body: [
      "Gizi seimbang bukan berarti harus mahal. Prinsip utamanya adalah memenuhi kebutuhan karbohidrat, protein, lemak, vitamin, dan mineral dalam porsi yang tepat setiap hari.",
      "Isi piring idealnya terdiri dari setengah bagian sayur dan buah, seperempat karbohidrat, dan seperempat protein. Untuk keluarga di Kabupaten Madiun, sumber protein bisa dipenuhi dari tempe, tahu, telur, atau ikan nila yang harganya terjangkau.",
      "Yang penting adalah konsistensi. Menyusun menu mingguan lebih dulu membuat belanja jadi lebih hemat dan gizi keluarga tetap terjaga.",
    ],
  },
  {
    id: "artikel-pangan-lokal",
    title: "Kenapa Memilih Pangan Lokal?",
    excerpt:
      "Pangan lokal lebih segar, lebih murah, dan membantu petani di sekitar kita.",
    category: "Pangan Lokal",
    readMinutes: 3,
    body: [
      "Pangan lokal adalah bahan makanan yang diproduksi di daerah sekitar kita. Karena jarak tempuhnya pendek, kesegarannya lebih terjaga dan harganya biasanya lebih murah.",
      "Di Kabupaten Madiun, kita mudah menemukan beras, tempe, kangkung, jagung manis, dan ikan nila. Memilih bahan-bahan ini berarti turut mendukung petani dan pelaku usaha lokal.",
      "NutriVillage AI mengutamakan pangan lokal dalam rekomendasinya supaya menu yang disusun tetap hemat dan bergizi.",
    ],
  },
  {
    id: "artikel-hemat-budget",
    title: "Tips Menyusun Menu dengan Anggaran Terbatas",
    excerpt: "Beberapa cara praktis menekan biaya belanja tanpa mengurangi nilai gizi.",
    category: "Tips Hemat",
    readMinutes: 5,
    body: [
      "Langkah pertama adalah menentukan anggaran harian keluarga. Setelah itu, susun menu yang memakai bahan yang sedang musim karena harganya lebih murah.",
      "Manfaatkan bahan yang bisa dipakai di beberapa menu sekaligus, misalnya tempe untuk oseng dan sayur lodeh. Ini membuat belanja lebih efisien.",
      "Terakhir, catat daftar belanja sebelum pergi ke pasar agar tidak membeli barang di luar rencana.",
    ],
  },
  {
    id: "artikel-alergi",
    title: "Mengelola Alergi Makanan di Rumah",
    excerpt: "Cara mencatat dan menghindari bahan pemicu alergi saat menyusun menu.",
    category: "Kesehatan",
    readMinutes: 4,
    body: [
      "Alergi makanan perlu dicatat dengan rapi agar tidak terlewat saat memasak. Catat bahan pemicunya, misalnya kacang, seafood, atau telur.",
      "Saat menyusun menu, pastikan bahan pemicu tidak dipakai. Aplikasi seperti NutriVillage AI dapat menyaring menu yang mengandung bahan pantangan keluarga.",
      "Selalu periksa label kemasan dan tanyakan bahan saat membeli makanan jadi.",
    ],
  },
];

export async function getArticles(): Promise<Article[]> {
  return [...ARTICLES];
}

export async function getArticleById(id: string): Promise<Article | null> {
  return ARTICLES.find((article) => article.id === id) ?? null;
}

const notifications: Notification[] = [
  { id: "notif-1", title: "Rekomendasi baru tersedia", message: "3 menu bergizi sudah disiapkan sesuai anggaran keluarga.", createdAt: daysAgo(0), read: false, kind: "success" },
  { id: "notif-2", title: "Harga bahan diperbarui", message: "Harga tempe dan kangkung sudah diverifikasi admin hari ini.", createdAt: daysAgo(1), read: false, kind: "info" },
  { id: "notif-3", title: "Stok musiman", message: "Jagung manis sedang musim, menu berbahan jagung lebih hemat.", createdAt: daysAgo(2), read: true, kind: "info" },
  { id: "notif-4", title: "Pengingat jadwal masak", message: "Meal Planner pekan ini belum lengkap. Yuk isi jadwalnya.", createdAt: daysAgo(3), read: true, kind: "warning" },
];

export async function getNotifications(): Promise<Notification[]> {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
