"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { FamilyProfileSchema } from "@/schemas/profile";

const ProfileResponseSchema = FamilyProfileSchema.nullable();

/** FR-05/FR-07: Server State profil keluarga. */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: ({ signal }) => apiGet("/api/profile", ProfileResponseSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** FR-05: simpan data keluarga. Input mentah divalidasi Zod di server. */
export function useSaveProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: unknown) =>
      apiSend("/api/profile", "PUT", input, FamilyProfileSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.detail(), data);
    },
  });
}
