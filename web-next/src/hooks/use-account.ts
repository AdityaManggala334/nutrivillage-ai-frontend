"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { AccountSchema, type AccountInput } from "@/schemas/account";

const AccountResponseSchema = AccountSchema.nullable();

/** FR-18: data diri pengguna (Server State). */
export function useAccount() {
  return useQuery({
    queryKey: queryKeys.account.detail(),
    queryFn: ({ signal }) => apiGet("/api/account", AccountResponseSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** FR-18: simpan perubahan data diri. */
export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInput) =>
      apiSend("/api/account", "PUT", AccountSchema.parse(input), AccountSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.account.detail(), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.session.all });
    },
  });
}

/** Skema respons untuk validasi runtime (dipakai z.infer agar konsisten). */
export const AccountResponse = z.object({ name: z.string(), email: z.string(), phone: z.string() });
