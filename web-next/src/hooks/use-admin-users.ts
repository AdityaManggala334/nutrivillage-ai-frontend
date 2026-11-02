"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  AdminUserListSchema,
  AdminUserSchema,
  type AdminUserCreateBody,
  type AdminUserUpdateBody,
} from "@/schemas/admin";

/** Daftar pengguna untuk panel admin (Server State). */
export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(),
    queryFn: ({ signal }) => apiGet("/api/admin/users", AdminUserListSchema, signal),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateAdminUserMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUserCreateBody) =>
      apiSend("/api/admin/users", "POST", input, AdminUserSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminUserUpdateBody }) =>
      apiSend(`/api/admin/users/${id}`, "PATCH", input, AdminUserSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });
}
