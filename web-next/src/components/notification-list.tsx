"use client";

import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDateId } from "@/lib/utils";
import type { Notification } from "@/schemas/content";

const KIND = {
  info: { tone: "info" as const, Icon: Info, label: "Info" },
  success: { tone: "brand" as const, Icon: CheckCircle2, label: "Sukses" },
  warning: { tone: "harvest" as const, Icon: TriangleAlert, label: "Peringatan" },
};

/**
 * FR-21: daftar notifikasi pengguna.
 *
 * Dimuat di sisi klien dari `/api/notifications` (Server State lewat TanStack
 * Query) sehingga perpindahan halaman terasa instan dan tidak menunggu
 * render server — cache juga dibagi dengan lonceng notifikasi di topbar.
 */
export function NotificationList() {
  const { data, isPending, isError, error, refetch, isFetching } = useNotifications();

  if (isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat notifikasi"
        message={error instanceof Error ? error.message : "Terjadi kesalahan tak terduga."}
        action={
          <Button intent="danger" onClick={() => void refetch()} loading={isFetching}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  const notifications: readonly Notification[] = data ?? [];

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Belum ada notifikasi"
        description="Pemberitahuan akan muncul di sini setelah ada aktivitas pada akunmu."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {notifications.map((notification) => {
        const meta = KIND[notification.kind];
        const Icon = meta.Icon;
        return (
          <li key={notification.id} className="glass-subtle flex gap-3 rounded-2xl p-4">
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
  );
}
