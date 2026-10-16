# NutriVillage AI — Frontend (Next.js 15)

Repo ini adalah **frontend**. Aplikasi Next.js ada di folder **`web-next/`**
(folder root berisi versi lama berbasis Vite, hanya sebagai referensi).

Ia dipakai bersama repo backend
[`nutrivillage-ai-backend`](https://github.com/AdityaManggala334/nutrivillage-ai-backend).

---

## ⭐ Cara tercepat — Docker (lihat SETUP.md repo backend)

Cukup clone kedua repo bersebelahan, lalu dari repo backend:

```bash
docker compose -f docker-compose.full.yml up --build
# buka http://localhost:3000
```

Dengan cara ini kamu **tidak perlu** install Node.js/Python/MySQL.

---

## Cara manual (tanpa Docker)

Butuh **Node.js 22** (sama dengan versi CI GitHub Actions — lihat `.nvmrc` dan
`web-next/.nvmrc`). Backend harus sudah berjalan di `http://127.0.0.1:8000`
(lihat SETUP.md repo backend).

**Linux / macOS**

```bash
cd web-next
cp .env.example .env.local     # lalu sesuaikan bila perlu
npm install
npm run dev                    # buka http://localhost:3000
```

**Windows (PowerShell / CMD)**

```powershell
cd web-next
copy .env.example .env.local
npm install
npm run dev
```

Catatan Windows:

- Node.js 22: pasang lewat installer MSI, atau `nvm-windows` (perintahnya berbeda
  dari `nvm` di Linux).
- Bila clone berada di path panjang, aktifkan `git config --system core.longpaths true`
  agar `npm install` tidak gagal karena batas 260 karakter Windows.
- Sebaiknya set `git config --global core.autocrlf input`; repo sudah menyertakan
  `.gitattributes` sehingga berkas tetap tersimpan dengan LF.

**Penting:** nilai `JWT_SECRET` di `.env.local` **harus sama persis** dengan
`JWT_SECRET` di backend (`nutrivillage-ai-backend/.env`). Kalau berbeda, login
akan berhasil tetapi sesi langsung hilang.

Isi `.env.local`:

```env
JWT_SECRET=nutrivillage-dev-secret-change-me
API_BASE_URL=http://127.0.0.1:8000
API_PREFIX=/api/v1
```

### Akun demo

Akun ini dibuat otomatis oleh `python scripts/init_db.py` **hanya bila**
`SEED_DEMO_ACCOUNTS=true` (default di lokal; di produksi `render.yaml` menyetel `0`,
sehingga yang dibuat hanya admin dari `BOOTSTRAP_ADMIN_*`).

| Peran | Email | Password |
| --- | --- | --- |
| Masyarakat | `keluarga@nutrivillage.id` | `nutrivillage` |
| Petugas SPPG | `sppg@nutrivillage.id` | `sppg12345` |
| Admin | `admin@nutrivillage.id` | `admin12345` |

---

## Skrip

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Server pengembangan (Turbopack) |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Cek TypeScript |

## Catatan

- Browser **tidak** memanggil backend secara langsung: frontend memanggil
  backend dari sisi server lewat `API_BASE_URL`, sehingga di Docker nilainya
  `http://backend:8000` (nama service), bukan `127.0.0.1`.
- Perubahan kode: commit & push. Pengguna memperbarui dengan
  `git pull` lalu rebuild.
