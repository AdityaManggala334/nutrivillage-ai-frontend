import type { Metadata } from "next";
import { AdminFoodSafetyActions } from "@/components/admin-food-safety-actions";
import { AdminCell, AdminPageHeader, AdminTable } from "@/components/admin-table";
import { Badge } from "@/components/ui";
import { getFoodSafetyInfo } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Informasi Keamanan Pangan",
  robots: { index: false, follow: false },
};

/** Pengelolaan & verifikasi informasi keamanan pangan (edukasi terverifikasi). */
export default async function AdminFoodSafetyPage() {
  const items = await getFoodSafetyInfo();

  return (
    <div>
      <AdminPageHeader
        title="Informasi Keamanan Pangan"
        description="Kelola penjelasan bahaya dan panduan penanganan. Hanya entri terverifikasi yang boleh ditampilkan sebagai fakta kepada pengguna."
      />

      <p className="mb-4 rounded-xl bg-harvest-50 px-4 py-3 text-xs text-harvest-900 dark:bg-harvest-900/30 dark:text-harvest-100">
        Informasi ini bersifat edukatif dan menggantikan kebutuhan fitur pemindaian bahan. Sistem
        tidak mendeteksi racun melalui kamera.
      </p>

      <AdminTable
        headers={["Bahan / Konteks", "Jenis risiko", "Status", "Sumber", "Aksi"]}
      >
        {items.map((item) => (
          <tr key={item.id} className="align-top transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
            <AdminCell className="font-medium">
              <p className="font-semibold">{item.topic}</p>
              <p className="mt-1 max-w-md text-xs text-stone-500">{item.hazard}</p>
            </AdminCell>
            <AdminCell>{item.riskType}</AdminCell>
            <AdminCell>
              <Badge
                tone={
                  item.verification === "verified"
                    ? "brand"
                    : item.verification === "rejected"
                      ? "danger"
                      : "harvest"
                }
              >
                {item.verification === "verified"
                  ? "Terverifikasi"
                  : item.verification === "rejected"
                    ? "Ditolak"
                    : "Menunggu verifikasi"}
              </Badge>
            </AdminCell>
            <AdminCell className="text-xs text-stone-500">
              <p>{item.source}</p>
              <p className="mt-1 max-w-xs">Penanganan: {item.handling}</p>
            </AdminCell>
            <AdminCell>
              <AdminFoodSafetyActions id={item.id} verification={item.verification} />
            </AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
