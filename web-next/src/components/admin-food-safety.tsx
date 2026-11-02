"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import {
  FoodSafetyInputSchema,
  type FoodSafetyInfo,
  type FoodSafetyInput,
} from "@/schemas/admin";

const emptyForm = (): FoodSafetyInput => ({
  topic: "",
  riskType: "",
  hazard: "",
  handling: "",
  source: "",
  verification: "pending",
});

function DialogKeamanan({
  item,
  onClose,
}: {
  readonly item: FoodSafetyInfo | null;
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FoodSafetyInput>(
    item
      ? {
          topic: item.topic,
          riskType: item.riskType,
          hazard: item.hazard,
          handling: item.handling,
          source: item.source,
          verification: item.verification,
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const parsed = FoodSafetyInputSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        item ? `/api/admin/food-safety/${item.id}` : "/api/admin/food-safety",
        {
          method: item ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gagal menyimpan catatan.");
      }
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan catatan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Ubah Catatan Keamanan" : "Tambah Catatan Keamanan"}</DialogTitle>
          <DialogDescription>Hanya catatan terverifikasi yang tampil ke pengguna.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs">Topik / bahan</Label>
            <Input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Jenis risiko</Label>
            <Input value={form.riskType} onChange={(event) => setForm({ ...form, riskType: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Bahaya</Label>
            <Textarea rows={2} value={form.hazard} onChange={(event) => setForm({ ...form, hazard: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Cara penanganan</Label>
            <Textarea rows={2} value={form.handling} onChange={(event) => setForm({ ...form, handling: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Sumber</Label>
            <Input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Status</Label>
            <Select
              value={form.verification}
              onChange={(event) =>
                setForm({ ...form, verification: event.target.value as FoodSafetyInput["verification"] })
              }
            >
              <option value="pending">Pending</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
            </Select>
          </div>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button type="button" intent="ghost">Batal</Button></DialogClose>
          <Button type="button" onClick={submit} loading={loading}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminFoodSafety({ items }: { readonly items: FoodSafetyInfo[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<FoodSafetyInfo | null | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);

  const ubahStatus = async (item: FoodSafetyInfo, verification: "verified" | "rejected") => {
    setBusy(item.id);
    try {
      const response = await fetch(`/api/admin/food-safety/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification }),
      });
      if (!response.ok) throw new Error("Gagal mengubah status.");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal mengubah status.");
    } finally {
      setBusy(null);
    }
  };

  const hapus = async (item: FoodSafetyInfo) => {
    if (!window.confirm(`Hapus catatan "${item.topic}"?`)) return;
    setBusy(item.id);
    try {
      const response = await fetch(`/api/admin/food-safety/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus catatan.");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus catatan.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => setDialog(null)}>
          <Plus className="mr-2 size-4" /> Tambah Catatan
        </Button>
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
            <tr>
              <th className="px-4 py-2">Bahan / Konteks</th>
              <th className="px-3 py-2">Jenis risiko</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Sumber</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-2">
                  <p className="font-semibold">{item.topic}</p>
                  <p className="mt-1 max-w-md text-xs text-stone-500">{item.hazard}</p>
                </td>
                <td className="px-3 py-2">{item.riskType}</td>
                <td className="px-3 py-2">
                  <Badge tone={item.verification === "verified" ? "brand" : item.verification === "rejected" ? "danger" : "harvest"}>
                    {item.verification === "verified" ? "Terverifikasi" : item.verification === "rejected" ? "Ditolak" : "Pending"}
                  </Badge>
                </td>
                <td className="px-3 py-2">{item.source}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-center gap-1">
                    {item.verification !== "verified" ? (
                      <Button intent="primary" size="sm" disabled={busy === item.id} onClick={() => void ubahStatus(item, "verified")}>
                        <Check className="size-3.5" /> Verifikasi
                      </Button>
                    ) : null}
                    {item.verification !== "rejected" ? (
                      <Button intent="outline" size="sm" disabled={busy === item.id} onClick={() => void ubahStatus(item, "rejected")}>
                        <X className="size-3.5" /> Tolak
                      </Button>
                    ) : null}
                    <Button intent="ghost" size="sm" aria-label="Ubah" onClick={() => setDialog(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button intent="ghost" size="sm" aria-label="Hapus" disabled={busy === item.id} onClick={() => void hapus(item)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">Belum ada catatan.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">Total {items.length} catatan.</p>
      {dialog !== undefined ? <DialogKeamanan item={dialog} onClose={() => setDialog(undefined)} /> : null}
    </div>
  );
}
