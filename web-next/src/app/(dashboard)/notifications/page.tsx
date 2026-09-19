import type { Metadata } from "next";
import { Bell, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui";
import { formatDateId } from "@/lib/utils";
import { getNotifications } from "@/server/content-data";

export const metadata: Metadata = {
  title: "Notifikasi",
  description: "Pemberitahuan rekomendasi, harga, dan jadwal masak.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const KIND = {
  info: { tone: "info" as const, Icon: Info, label: "Info" },
  success: { tone: "brand" as const, Icon: CheckCircle2, label: "Sukses" },
  warning: { tone: "harvest" as const, Icon: TriangleAlert, label: "Peringatan" },
};

/** FR-21: halaman notifikasi pengguna. */
export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Pemberitahuan"
        title="Notifikasi"
        description="Informasi terbaru seputar rekomendasi, harga bahan, dan jadwal masak."
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Pemberitahuan akan muncul di sini setelah ada aktivitas pada akunmu."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => {
            const meta = KIND[notification.kind];
            const Icon = meta.Icon;
            return (
              <li
                key={notification.id}
                className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                      {notification.title}
                    </p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {!notification.read ? <Badge tone="danger">Baru</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {formatDateId(notification.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center gap-2 text-xs text-stone-400">
        <Bell className="size-3.5" aria-hidden="true" /> Notifikasi bersifat informasi pada versi
        ini.
      </p>
    </div>
  );
}
