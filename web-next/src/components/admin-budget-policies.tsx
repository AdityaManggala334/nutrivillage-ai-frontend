"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useBudgetPolicies } from "@/hooks/use-schools";
import type { BudgetPolicy } from "@/schemas/school";

/** FR-11: admin menetapkan batas anggaran bahan per porsi untuk SPPG. */
export function AdminBudgetPolicies() {
  const query = useBudgetPolicies();
  const [draft, setDraft] = useState<Record<number, { amount: string; source: string; verified: boolean }>>({});
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!query.data) return;
    setDraft(
      Object.fromEntries(
        query.data.map((policy) => [
          policy.id,
          {
            amount: policy.amountPerPortion === null ? "" : String(policy.amountPerPortion),
            source: policy.source ?? "",
            verified: policy.verified,
          },
        ]),
      ),
    );
  }, [query.data]);

  const simpan = async (policy: BudgetPolicy) => {
    const row = draft[policy.id];
    if (!row) return;
    setBusy(policy.id);
    setPesan(null);
    setError(null);
    try {
      const response = await fetch(`/api/budget-policies?id=${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPerPortion: row.amount.trim() === "" ? null : Number(row.amount),
          source: row.source.trim() || null,
          verified: row.verified,
        }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "Gagal menyimpan kebijakan.");
      setPesan(`${policy.label}: kebijakan disimpan.`);
      await query.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kebijakan.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {pesan ? <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{pesan}</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {query.isLoading ? (
        <p className="text-sm text-stone-500">Memuat kebijakan…</p>
      ) : query.isError ? (
        <p className="text-sm text-red-600">
          {query.error instanceof Error ? query.error.message : "Gagal memuat kebijakan."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(query.data ?? []).map((policy) => {
            const row = draft[policy.id] ?? { amount: "", source: "", verified: false };
            return (
              <Card key={policy.id}>
                <CardHeader>
                  <CardTitle>{policy.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`bp-${policy.id}`}>Batas anggaran per porsi (Rp)</Label>
                    <Input
                      id={`bp-${policy.id}`}
                      type="number"
                      min={0}
                      step={500}
                      placeholder="Kosongkan untuk memakai standar BGN"
                      value={row.amount}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, [policy.id]: { ...row, amount: event.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`bp-src-${policy.id}`}>Sumber</Label>
                    <Input
                      id={`bp-src-${policy.id}`}
                      value={row.source}
                      placeholder="SK BGN / survei pasar"
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, [policy.id]: { ...row, source: event.target.value } }))
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={row.verified}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, [policy.id]: { ...row, verified: event.target.checked } }))
                      }
                    />
                    Sudah diverifikasi
                  </label>
                  <Button type="button" size="sm" loading={busy === policy.id} onClick={() => void simpan(policy)}>
                    <Save className="mr-2 size-4" /> Simpan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
