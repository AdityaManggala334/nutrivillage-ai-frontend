"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

const ResponseSchema = z.object({
  explanation: z.string().min(1),
  model: z.string(),
  source: z.enum(["llm", "fallback", "cache"]),
});

type Sumber = z.infer<typeof ResponseSchema>["source"];

const LABEL_SUMBER: Record<Sumber, string> = {
  llm: "Disusun AI",
  cache: "Penjelasan tersimpan",
  fallback: "Ringkasan otomatis",
};

/**
 * C3 (FR-11): tombol "Jelaskan menu ini" di detail resep.
 *
 * Konteks dikirim sebagai recipe_id saja; backend yang mengambil data menu
 * dari database dan membaca cache, sehingga angka di penjelasan dijamin sama
 * dengan angka di layar.
 */
export function AiExplanation({ recipeId }: { readonly recipeId: string }) {
  const [teks, setTeks] = useState<string | null>(null);
  const [sumber, setSumber] = useState<Sumber | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const mutasi = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/explain-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: Number(recipeId) }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const pesan =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message: unknown }).message)
            : "Penjelasan gagal dimuat.";
        throw new Error(pesan);
      }
      return ResponseSchema.parse(data);
    },
    onSuccess: (data) => {
      setTeks(data.explanation);
      setSumber(data.source);
      setModel(data.model);
    },
  });

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
          <Sparkles className="size-4 text-brand-600" aria-hidden="true" /> Penjelasan menu
        </p>
        {sumber ? (
          <span className="text-[11px] text-stone-400">
            {LABEL_SUMBER[sumber]}
            {model && model !== "cache" ? ` Â· ${model}` : ""}
          </span>
        ) : null}
      </div>

      {teks ? (
        <p className="mt-2.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
          {teks}
        </p>
      ) : (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Minta AI menjelaskan kenapa menu ini cocok untuk keluargamu â€” angkanya
          diambil dari data gizi dan harga yang terverifikasi.
        </p>
      )}

      <div className="mt-3">
        <Button
          intent={teks ? "outline" : "primary"}
          size="sm"
          onClick={() => mutasi.mutate()}
          disabled={mutasi.isPending}
        >
          {mutasi.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menyusun penjelasanâ€¦
            </>
          ) : teks ? (
            "Segarkan penjelasan"
          ) : (
            "Jelaskan menu ini"
          )}
        </Button>
      </div>

      {mutasi.isError ? (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {mutasi.error instanceof Error ? mutasi.error.message : "Gagal memuat penjelasan."}
        </p>
      ) : null}
    </div>
  );
}
