"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { NotificationSchema } from "@/schemas/content";

const NotificationListSchema = z.array(NotificationSchema);

/** FR-21: daftar notifikasi pengguna (Server State). */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ signal }) => apiGet("/api/notifications", NotificationListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** B9: jumlah notifikasi belum dibaca (badge lonceng). */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, "unread-count"],
    queryFn: ({ signal }) =>
      apiGet(
        "/api/notifications/unread-count",
        z.object({ count: z.number().int().min(0) }),
        signal,
      ),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

/** B9: tandai satu notifikasi sudah dibaca. */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiSend(
        `/api/notifications/${id}/read`,
        "PATCH",
        {},
        NotificationSchema,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
