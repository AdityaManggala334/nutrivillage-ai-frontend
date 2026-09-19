# NutriVillage AI — Next.js App Router (Modul 5, 6 & 7)

Aplikasi **NutriVillage AI** — rekomendasi menu bergizi berbasis pangan lokal Kabupaten
Madiun. Folder ini adalah kelanjutan Modul 1–4 (Vanilla TypeScript + Vite) yang di-*upgrade*
ke arsitektur modern **sekaligus memuat ulang seluruh halaman Modul 1–4** dengan desain yang
sama, sehingga menjadi **satu aplikasi Next.js utuh**:

- **Modul 1–2** — Landing page, HTML semantik, ARIA, Tailwind CSS v4, responsif.
- **Modul 3–4** — Strict TypeScript, Zod, CVA, discriminated unions, mock API async.
- **Modul 5** — React 19 + React Compiler, komponen UI reusable (CVA), state & async UI.
- **Modul 6** — Next.js 15 App Router, RSC, nested layout, Streaming SSR, Middleware, Metadata.
- **Modul 7** — Zustand (Client UI State) + TanStack Query v5 (Server State), cache & invalidasi.

> Proyek Vite Modul 1–4 tetap disimpan di root `nutrivillage-ai-frontend/` sebagai referensi.
> Aplikasi utama sekarang adalah **`web-next/`** dan berisi semua halaman.

---

## 1. Teknologi

| Kategori | Pustaka / Versi |
| --- | --- |
| Meta-framework | Next.js 15.5 (App Router, Turbopack) |
| UI | React 19 + React Compiler (`experimental.reactCompiler`) |
| Bahasa | TypeScript strict (`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4 (`@theme` design tokens, dark mode class) |
| Komponen | Class Variance Authority (CVA) + clsx + tailwind-merge |
| Headless UI | Radix UI (Dialog, Tabs, Switch) — pola shadcn/ui |
| Tipe lanjutan | Branded Types, Discriminated Unions (`AsyncState`), Utility Types (`Pick`/`Omit`/`Partial`) |
| Ikon | lucide-react |
| Validasi | Zod 4 (`z.infer` untuk tipe) |
| Client UI State | Zustand 5 |
| Server State | TanStack Query v5 (+ Devtools) |

---

## 2. Prasyarat & Menjalankan

- Node.js **20+**, npm 10+

```bash
# dari root repository
cd web-next

npm install       # cukup sekali
npm run dev       # http://localhost:3000

npm run build     # build produksi + cek bundle
npm start         # jalankan hasil build
npm run typecheck # tsc --noEmit
npm run lint      # eslint
```

**Akun demo:**
- Pengguna — email `keluarga@nutrivillage.id`, password `nutrivillage`
- Admin — email `admin@nutrivillage.id`, password `admin12345` (akses panel `/admin`)

Di halaman login tersedia kotak **Akun Demo** beserta tombol isi otomatis untuk kedua akun.
Halaman `/dashboard`, `/onboarding`, `/explore`, `/history`, `/favorites`,
`/meal-planner`, `/shopping-list`, `/profile`, `/notifications`, dan `/admin` dilindungi
middleware; pengunjung tanpa cookie akan diarahkan ke `/login`.

---

## 3. Struktur Folder

```
web-next/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                  # Root Layout (RSC) + Metadata + font Plus Jakarta Sans
│  │  ├─ page.tsx                    # Landing page (FR-03) — RSC
│  │  ├─ loading.tsx  error.tsx  not-found.tsx
│  │  ├─ login/page.tsx              # FR-01, FR-02, FR-03 (login/register/tamu)
│  │  ├─ onboarding/page.tsx         # FR-04, FR-05 (onboarding + data keluarga)
│  │  ├─ recipes/[id]/               # FR-11 dynamic route (RSC + generateMetadata)
│  │  ├─ (dashboard)/                # Route group dengan NESTED LAYOUT
│  │  │  ├─ layout.tsx               # Sidebar + Topbar (state dipertahankan)
│  │  │  ├─ dashboard/page.tsx       # FR-07 (profil, rekomendasi, akses cepat)
│  │  │  ├─ explore/page.tsx         # FR-08, FR-10
│  │  │  ├─ history/page.tsx         # FR-13, FR-14
│  │  │  ├─ favorites/page.tsx       # FR-20 (menu favorit)
│  │  │  ├─ meal-planner/page.tsx    # FR-26, FR-27, FR-28
│  │  │  └─ shopping-list/page.tsx   # FR-15, FR-16 (daftar belanja)
│  │  └─ api/                        # Route Handlers (mock backend)
│  │     ├─ auth/{login,register,guest,logout,session}/
│  │     ├─ profile/  recipes/  recommendations/
│  │     ├─ history/[id]/  meal-plans/  shopping-list/
│  ├─ components/
│  │  ├─ ui/                         # Komponen CVA reusable (RSC)
│  │  │  button.tsx  button-link.tsx  badge.tsx  card.tsx  input.tsx  skeleton.tsx
│  │  ├─ landing-page.tsx  site-header.tsx  site-footer.tsx   # Modul 1-2
│  │  ├─ auth-form.tsx  onboarding-flow.tsx  dashboard-home.tsx
│  │  ├─ dashboard-chrome.tsx        # sidebar + topbar dashboard
│  │  ├─ recipe-card.tsx  recipe-detail.tsx  recipe-image.tsx
│  │  ├─ nutrition-facts.tsx  score-breakdown.tsx
│  │  ├─ explore-form.tsx  explore-client.tsx  recommendation-results.tsx
│  │  ├─ history-list.tsx  meal-planner-board.tsx  shopping-list-panel.tsx
│  │  ├─ providers.tsx  save-recipe-button.tsx  recipe-actions.tsx
│  │  └─ section-heading.tsx  empty-state.tsx  error-state.tsx  guest-login-button.tsx
│  ├─ hooks/                         # Custom hooks TanStack Query
│  │  use-auth.ts  use-session.ts  use-profile.ts
│  │  use-recipes.ts  use-recommendations.ts  use-history.ts  use-meal-planner.ts
│  ├─ stores/                        # Zustand (Client UI State)
│  │  ui-store.ts  meal-planner-store.ts
│  ├─ schemas/                       # Zod schemas + tipe turunan
│  │  auth.ts  profile.ts  domain.ts  explore.ts
│  ├─ server/                        # HANYA server (import "server-only")
│  │  mock-data.ts  data.ts  auth.ts  http.ts
│  ├─ lib/
│  │  api-client.ts  query-keys.ts  constants.ts  utils.ts
│  └─ middleware.ts                  # Proteksi rute (edge)
├─ docs/
│  ├─ Matriks_Modul5_SRS_vs_UI.pdf
│  └─ Matriks_Modul7_State_Separation.pdf
└─ next.config.ts  tsconfig.json  package.json
```

---

## 4. Peta Rute

| Rute | Tipe | Deskripsi | FR |
| --- | --- | --- | --- |
| `/` | Static (RSC) | Landing page (hero, fitur, cara kerja, testimoni, FAQ, CTA) | FR-03 |
| `/login` | Static | Login, register, dan mode tamu | FR-01, FR-02, FR-03 |
| `/onboarding` | Protected | Onboarding 4 langkah + form data keluarga | FR-04, FR-05 |
| `/dashboard` | Protected | Ringkasan profil, rekomendasi terakhir, akses cepat | FR-06, FR-07 |
| `/explore` | Protected | Form parameter + hasil rekomendasi | FR-08, FR-10 |
| `/recipes/[id]` | Dynamic (RSC) | Detail resep + gizi, bahan, cara masak | FR-11 |
| `/history` | Protected | Riwayat rekomendasi + filter | FR-13, FR-14 |
| `/favorites` | Protected | Menu favorit (riwayat filter favorit) | FR-20 |
| `/meal-planner` | Protected | Kalender jadwal masak mingguan | FR-26, FR-27, FR-28 |
| `/shopping-list` | Protected | Checklist belanja + catatan | FR-15, FR-16, FR-17 |
| `/profile` | Protected | Data diri, data keluarga, preferensi, pengaturan akun | FR-18, FR-19, FR-21 |
| `/notifications` | Protected | Notifikasi pengguna | FR-21 |
| `/katalog` | Public (RSC) | Katalog resep umum (guest mode) | FR-03 |
| `/artikel` · `/artikel/[id]` | Public (RSC) | Artikel gizi | FR-03 |
| `/admin` | Protected | Dashboard admin (statistik, harga pending, scraper) | FR-22 |
| `/admin/bahan` · `/admin/nutrisi` · `/admin/menu` | Protected | Data master | FR-22, FR-30 |
| `/admin/harga` | Protected | Verifikasi & histori harga | FR-23 |
| `/admin/musim` · `/admin/lokal` | Protected | Data musim & komoditas lokal | FR-22 |
| `/admin/monitoring` | Protected | Monitoring & log scraper | FR-31, FR-34 |

### API Route Handlers

| Method | Endpoint | Validasi |
| --- | --- | --- |
| POST | `/api/auth/login` \| `/api/auth/register` \| `/api/auth/guest` | `LoginSchema` / `RegisterSchema` |
| GET | `/api/auth/session` | — |
| POST | `/api/auth/logout` | — |
| GET / PUT | `/api/profile` | `familyProfileFormSchema` (422 bila gagal) |
| GET / PUT | `/api/account` | `AccountSchema` (data diri) |
| GET | `/api/recipes` \| `/api/recipes/[id]` | — |
| POST | `/api/recommendations` | `ExploreFormSchema` |
| GET / POST | `/api/history` | `HistoryFilterSchema` / `SaveHistoryBodySchema` |
| DELETE / PATCH | `/api/history/[id]` | — |
| GET / POST / DELETE | `/api/meal-plans` | `AssignMealBodySchema` |
| GET / POST / PATCH / DELETE | `/api/shopping-list` | `{ weekId }` / `{ recipeId }` / `{ itemId, checked }` / `{ note }` |
| GET | `/api/notifications` | — |
| PATCH | `/api/admin/prices/[id]` | `{ status }` (verifikasi harga) |

---

## 5. Pemisahan React Server Components vs Client Components

**59 dari 84 komponen (.tsx) adalah RSC (≈ 70,2%)** — memenuhi target Modul 6 (minimal 70%).

25 Client Components (seluruhnya daun hierarki interaktif):

```
providers.tsx · theme-toggle.tsx · auth-form.tsx · guest-login-button.tsx
onboarding-flow.tsx · dashboard-chrome.tsx · dashboard-home.tsx
explore-client.tsx · explore-form.tsx · recommendation-results.tsx
save-recipe-button.tsx · recipe-actions.tsx · history-list.tsx
meal-planner-board.tsx · shopping-list-client.tsx · profile-settings.tsx
admin-nav.tsx · admin-topbar.tsx · admin-price-actions.tsx
ui/dialog.tsx · ui/tabs.tsx · ui/switch.tsx
app/error.tsx · (dashboard)/error.tsx · recipes/[id]/error.tsx
```

Pola yang diterapkan:

- **Server-side data fetching** di RSC: `app/recipes/[id]/page.tsx` memakai
  `getRecipeForRequest()` (React `cache()` untuk deduplikasi per-request).
- **Streaming SSR**: `<Suspense>` + `loading.tsx` + skeleton (dashboard dan detail resep).
- **Isolasi `"use client"` di daun**: layout induk tetap RSC.
- **Nested Layout**: Root Layout → `(dashboard)/layout.tsx` (sidebar/topbar tidak re-render).
- **Metadata API**: statis di root & tiap halaman, dinamis (`generateMetadata`) di `/recipes/[id]`.
- **Middleware**: `src/middleware.ts` memeriksa cookie `nutrivillage_session`; untuk rute
  `/admin` juga memeriksa cookie `nutrivillage_role` (**RBAC** — hanya role admin). Login
  sebagai admin diarahkan ke `/admin`, pengguna biasa ke `/onboarding`/`/dashboard`.

---

## 6. Pemisahan State (Modul 7)

**Zustand — Client UI State** (`stores/`): `isSidebarOpen`, `themeMode`,
`activeHistoryFilter`, `searchQuery`, `isExploreFormOpen`, `pickerTarget`,
`selectedRecipeId`, `draggingRecipeId`.

**TanStack Query — Server State** (`hooks/`): `session`, `profile`, `recipes`, `recipe`,
`recommendations`, `history`, `mealPlans`, `shoppingList`.

Konfigurasi cache global: **`staleTime: 5 menit`**, **`gcTime: 15 menit`**. Setiap mutasi
menginvalidasi cache terkait (mis. simpan profil → invalidasi `['profile']`; assign menu →
invalidasi `['meal-plans', week]` & `['shopping-list', week]`). Optimistic update diterapkan
pada hapus/favorit riwayat.

Semua respons API divalidasi Zod di `lib/api-client.ts` **sebelum** masuk cache TanStack Query.

### 6.1 Cara Memeriksa Query & Cache

1. **React Query Devtools** — jalankan `npm run dev`, buka aplikasi, lalu klik ikon React Query
   di sudut bawah layar. Panel menampilkan setiap query, `staleTime`/`gcTime`, status
   (`fresh` / `stale` / `fetching` / `inactive`), data, serta observer-nya. Devtools hanya
   aktif di mode development.
2. **Console browser** — Query Client di-expose di mode development:
   ```js
   __QUERY_CLIENT__.getQueryCache().getAll().map((q) => ({
     key: q.queryKey,
     staleTime: q.options.staleTime,
     gcTime: q.options.gcTime,
     state: q.state.status,
   }));
   ```
3. **Tab Network** — selama data masih `fresh` (< 5 menit), berpindah halaman tidak memicu
   request ulang. Setelah mutasi (simpan/hapus riwayat, assign menu), `invalidateQueries`
   memicu refetch otomatis tanpa reload.
4. **Kode** — nilai terpusat: default di `components/providers.tsx`, query key di
   `lib/query-keys.ts`, dan `staleTime`/`gcTime` per query di tiap file `hooks/use-*.ts`.

---

## 7. Dokumentasi Matriks & Laporan

- `docs/Matriks_Modul5_SRS_vs_UI.pdf` — pemetaan SRS → komponen UI + komponen reusable.
- `docs/Matriks_Modul7_State_Separation.pdf` — klasifikasi state, cache, mutasi, Zod.
- `docs/Laporan_Performa_Modul5.pdf` — pengukuran bundle, proporsi RSC, React Compiler,
  Core Web Vitals, dan kesesuaian NFR/FR (NFR-02, NFR-06, FR-33, FR-35).
- `docs/Laporan_Modul5-7_NutriVillage_AI.docx` — **laporan lengkap Modul 5–7 dalam satu file**
  (pendahuluan, Modul 5, Modul 6, Modul 7, kesesuaian SKPL V3, verifikasi, lampiran).

---

## 8. Verifikasi Kode Statis & Kesesuaian SKPL V3 (diperbaiki)

**Verifikasi:**
- `npm run typecheck` (`tsc --noEmit`, strict) → 0 error
- `npm run lint` (`eslint-config-next`) → 0 error
- `npm run build` → sukses (23 halaman + 16 Route Handler + middleware)
- `sonar-project.properties` disediakan; jalankan:
  ```bash
  sonar-scanner -Dproject.settings=sonar-project.properties
  ```

**Kesesuaian dengan SKPL V3 (diperbaiki):**

| Kode | Kebutuhan | Implementasi |
| --- | --- | --- |
| NFR-02 | Respons rekomendasi ≤ 3 detik | Mock API ≤ 1,2 s + skeleton |
| NFR-06 | Harga bersumber + tanggal + disclaimer | `priceUpdatedAt` + `PriceDisclaimer` |
| FR-33 | Warning badge harga > 7 hari | `PriceFreshnessBadge` |
| FR-35 | Generate Explore maks. 5×/jam | `server/rate-limit.ts` + HTTP 429 |
| FR-06 | Analisis profil keluarga | Derivasi parameter rekomendasi dari profil |
| FR-07 | Home: profil, rekomendasi, favorit, tips, akses cepat | `dashboard-home.tsx` |

---

## 9. Mode Terang & Gelap

- State tema dikelola **Zustand** (`themeMode`) dan diterapkan sebagai class `.dark` pada
  `<html>` (Tailwind v4 `@custom-variant dark`).
- Tombol ganti tema tersedia di **semua halaman**: header publik (`ThemeToggle` varian icon)
  dan sidebar dashboard (varian menu).
- Preferensi disimpan di `localStorage` (`nutrivillage-theme`). `ThemeScript` (RSC) di `<head>`
  menerapkannya **sebelum** React hydrate untuk mencegah kedipan (FOUC).
- Lapisan tema terpusat di `globals.css` (`@layer utilities`) memetakan utility netral
  (`bg-white`, `text-stone-*`, `border-stone-*`, `bg-brand-*`, dll.) ke palet gelap, sehingga
  seluruh halaman Modul 1–7 konsisten tanpa duplikasi class.
- `color-scheme` ikut diset agar kontrol form & scrollbar menyesuaikan.

---

## 10. Catatan

- Tidak ada penggunaan tipe `any`.
- Desain disamakan dengan proyek Modul 1–4 (palet hijau *brand* + kuning *harvest*,
  font Plus Jakarta Sans, radius & shadow yang sama).
- Data bersifat simulasi (in-memory di server) karena fokus praktikum front-end.
- Aksesibilitas: ARIA, `focus-visible`, `prefers-reduced-motion`, navigasi keyboard.
