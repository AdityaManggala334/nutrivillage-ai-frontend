"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "@/lib/api-client";
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
