"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api-client";
import { HistoryEntrySchema, type HistoryEntry } from "@/schemas/domain";

const EntryOrNull = HistoryEntrySchema.nullable();

/**
 * FR-04: toggle favorit di halaman detail resep.
 * Belum ada entri riwayat -> simpan dulu (idempoten), lalu tandai favorit.
 */
export function FavoriteToggleButton({
  recipeId,
}: {
  readonly recipeId: string;
}) {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const muat = useMutation({
    mutationFn: () => apiGet(`/api/history/by-recipe/${recipeId}`, EntryOrNull),
    onSuccess: (data) => {
      setEntry(data);
      setReady(true);
    },
  });
  if (!ready && !muat.isPending && !muat.isError) void muat.mutate();

  const toggle = useMutation({
    mutationFn: async () => {
      setBusy(true);
      try {
        const target = entry ?? (await apiGet(`/api/history/by-recipe/${recipeId}`, EntryOrNull));
        if (!target) {
          const baru = await apiSend("/api/history", "POST", {
            recipeId,
            kind: "recommendation",
            note: "",
          }, HistoryEntrySchema);
          const selesai = await apiSend(`/api/history/${baru.id}`, "PATCH", { favorite: true }, HistoryEntrySchema);
          setEntry(selesai);
          return;
        }
        const selesai = await apiSend(`/api/history/${target.id}`, "PATCH", { favorite: !target.favorite }, HistoryEntrySchema);
        setEntry(selesai);
      } finally {
        setBusy(false);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  const aktif = entry?.favorite ?? false;
  return (
    <Button
      type="button"
      size="sm"
      intent={aktif ? "harvest" : "outline"}
      loading={toggle.isPending || busy || muat.isPending}
      onClick={() => toggle.mutate()}
      aria-pressed={aktif}
      aria-label={aktif ? "Hapus dari favorit" : "Tambahkan ke favorit"}
    >
      <Heart className="size-4" fill={aktif ? "currentColor" : "none"} aria-hidden="true" />
      {aktif ? "Favorit" : "Favoritkan"}
    </Button>
  );
}
