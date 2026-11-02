# Deploy Frontend NutriVillage AI — Vercel

Panduan ini men-deploy **frontend Next.js** (folder `web-next/`) ke **Vercel**.
Backend FastAPI dideploy terpisah ke Render (lihat `DEPLOY.md` repo backend).

```
Browser → Vercel (Next.js) → Render (FastAPI) → TiDB Cloud
```

---

## 1. Prasyarat
- Backend sudah jalan di Render dan kamu punya **URL-nya**
  (mis. `https://nutrivillage-api.onrender.com`).
- Akun [Vercel](https://vercel.com) (gratis), terhubung ke GitHub.

---

## 2. Import proyek di Vercel
1. Vercel → **Add New → Project** → pilih repo `nutrivillage-ai-frontend`.
2. **Root Directory** → klik *Edit* → pilih **`web-next`**.  ← WAJIB
3. Framework Preset: **Next.js** (otomatis terdeteksi).

---

## 3. Isi Environment Variables
Tambahkan di **Settings → Environment Variables** (untuk *Production*,
*Preview*, *Development*):

| Key | Nilai |
| --- | --- |
| `API_BASE_URL` | URL backend Render, mis. `https://nutrivillage-api.onrender.com` |
| `API_PREFIX` | `/api/v1` |
| `JWT_SECRET` | **sama persis** dengan `JWT_SECRET` di Render |

> ⚠️ `JWT_SECRET` **harus identik** dengan backend. Kalau berbeda, login akan
> "berhasil" tetapi sesi langsung hilang.

---

## 4. Deploy
Klik **Deploy**. Setelah selesai, buka domain yang diberikan
(mis. `https://nutrivillage.vercel.app`).

> Catatan: `vercel.json` sudah menaikkan `maxDuration` Route Handler menjadi 60s
> agar tahan terhadap **cold start** backend Render.

---

## 5. Verifikasi
- Halaman utama terbuka.
- **Daftar** akun baru → lalu **Masuk**.
- Login admin → buka **Panel Admin** → pastikan halaman `Harga` &
  `Keamanan Pangan` dapat dibuka (aksi verifikasi hanya untuk admin).

---

## 6. Kembali ke Render
Setelah dapat domain Vercel, kembali ke Render dan set
`CORS_ORIGINS=https://<domain-vercel>` lalu redeploy agar konsisten.

---

## 7. Update ke depannya
```bash
git push            # ke GitHub -> Vercel otomatis redeploy
```

---

## 8. Keep-warm (agar tidak lambat)
Backend Render free **tidur** setelah idle → request pertama 30–50 detik
(terasa saat pindah menu admin). Cegah dengan cron gratis:

1. Buka [cron-job.org](https://cron-job.org) → **Create cronjob**.
2. URL: `https://<nama-backend>.onrender.com/health`
3. Jadwal: **setiap 5–10 menit**.
4. Simpan.

> Tambahan: agar database TiDB juga tidak "scale-to-zero", ping juga sebuah
> endpoint yang menyentuh DB secara berkala (mis. login percobaan) — atau
> gunakan instance server selalu-nyala untuk hasil terbaik.

---

## Troubleshooting
| Gejala | Sebab / solusi |
| --- | --- |
| Build gagal "no project found" | Pastikan **Root Directory = `web-next`** |
| Halaman 500 / "backend tidak dapat dihubungi" | `API_BASE_URL` salah, atau backend Render sedang bangun (cold start) — coba lagi |
| Login berhasil tapi sesi hilang | `JWT_SECRET` tidak sama dengan backend |
| Login pertama lambat | Cold start Render; tunggu beberapa detik lalu ulangi |
| Navigasi admin terasa lambat | Cold start backend; pasang keep-warm (bagian 8) |
