"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  HistoryEntrySchema,
  type HistoryEntry,
  type HistoryFilter,
} from "@/schemas/domain";

export const HistoryListSchema = z.array(HistoryEntrySchema);
const MutationResultSchema = z.object({ id: z.string() });

const SaveHistoryInputSchema = z.object({
  recipeId: z.string().min(1),
  kind: z.enum(["recommendation", "meal-plan"]),
  note: z.string(),
});

export type SaveHistoryInput = z.infer<typeof SaveHistoryInputSchema>;

/** Modul 7: Server State riwayat, di-cache per filter aktif. */
export function useHistory(filter: HistoryFilter) {
  return useQuery({
    queryKey: queryKeys.history.list(filter),
    queryFn: ({ signal }) =>
      apiGet(`/api/history?filter=${filter}`, HistoryListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** Mutasi simpan ke riwayat (FR-12) + invalidasi cache otomatis. */
export function useSaveHistoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveHistoryInput) =>
      apiSend("/api/history", "POST", SaveHistoryInputSchema.parse(input), HistoryEntrySchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}

/** Hapus riwayat dengan optimistic update (langsung hilang dari UI). */
export function useDeleteHistoryMutation(filter: HistoryFilter) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.history.list(filter);

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/history/${id}`, MutationResultSchema),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<HistoryEntry[]>(listKey);
      queryClient.setQueryData<HistoryEntry[]>(listKey, (old) =>
        (old ?? []).filter((entry) => entry.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}

/** Toggle favorit dengan optimistic update. */
export function useToggleFavoriteMutation(filter: HistoryFilter) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.history.list(filter);

  return useMutation({
    mutationFn: (id: string) =>
      apiSend(`/api/history/${id}`, "PATCH", { favorite: true }, HistoryEntrySchema),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<HistoryEntry[]>(listKey);
      queryClient.setQueryData<HistoryEntry[]>(listKey, (old) =>
        (old ?? []).map((entry) =>
          entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
        ),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}
