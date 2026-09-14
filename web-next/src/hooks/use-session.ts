"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { UserSchema } from "@/schemas/auth";

const SessionResponseSchema = UserSchema.nullable();

/** Server State: user sesi aktif (untuk avatar/nama di sidebar & topbar). */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session.detail(),
    queryFn: ({ signal }) => apiGet("/api/auth/session", SessionResponseSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** Inisial maksimal 2 kata dari nama pengguna. */
export const initialsOf = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
