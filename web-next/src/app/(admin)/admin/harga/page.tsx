import type { Metadata } from "next";
import { AdminPriceActions } from "@/components/admin-price-actions";
import { AdminCell, AdminPageHeader, AdminStatusBadge, AdminTable } from "@/components/admin-table";
import { formatDateId, formatRupiah } from "@/lib/utils";
import { getAdminPrices } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Verifikasi Harga",
  robots: { index: false, follow: false },
};

/** FR-23: verifikasi data harga dan histori harga. */
export default async function AdminPricesPage() {
  const prices = await getAdminPrices();

  return (
    <div>
      <AdminPageHeader
        title="Verifikasi Harga"
        description="Periksa data harga hasil scraper sebelum dipakai Recommendation Engine."
      />
      <AdminTable headers={["Bahan", "Harga", "Sumber", "Tanggal", "Status", "Aksi"]}>
        {prices.map((price) => (
          <tr key={price.id} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
            <AdminCell className="font-medium">{price.ingredientName}</AdminCell>
            <AdminCell>
              {formatRupiah(price.price)} / {price.unit}
            </AdminCell>
            <AdminCell>{price.source}</AdminCell>
            <AdminCell>{formatDateId(price.recordedAt)}</AdminCell>
            <AdminCell>
              <AdminStatusBadge status={price.status} />
            </AdminCell>
            <AdminCell>
              <AdminPriceActions id={price.id} status={price.status} />
            </AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
