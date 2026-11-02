"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { AccountSchema, type AccountInput, type PasswordChangeInput } from "@/schemas/account";

const AccountResponseSchema = AccountSchema.nullable();
const OkSchema = z.object({ ok: z.literal(true) });

/** FR-18: data diri pengguna (Server State). Null untuk tamu/tanpa sesi. */
export function useAccount() {
  return useQuery({
    queryKey: queryKeys.account.detail(),
    queryFn: ({ signal }) => apiGet("/api/account", AccountResponseSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** FR-18/FR-21: simpan data diri & sakelar notifikasi ke database. */
export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInput) => apiSend("/api/account", "PATCH", input, AccountSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.account.detail(), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.session.all });
    },
  });
}

/** FR-18: ganti password (password lama diverifikasi oleh backend). */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (input: PasswordChangeInput) =>
      apiSend("/api/account/password", "PUT", input, OkSchema),
  });
}
