"use client";

import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import type { FamilyProfile } from "@/schemas/profile";
const GENDER_LABEL: Record<string, string> = {
  "laki-laki": "Laki-laki",
  perempuan: "Perempuan",
};

const ACTIVITY_LABEL: Record<string, string> = {
  rendah: "Aktivitas rendah",
  sedang: "Aktivitas sedang",
  tinggi: "Aktivitas tinggi",
};

/** B2: modal detail profil keluarga dari Beranda (bukan redirect bolak-balik). */
export function FamilyProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  readonly profile: FamilyProfile;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profil Keluarga</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
              <p className="text-[11px] font-medium text-stone-400">Anggota</p>
              <p className="mt-0.5 text-lg font-bold">{profile.members.length} orang</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
              <p className="text-[11px] font-medium text-stone-400">Budget harian</p>
              <p className="mt-0.5 text-lg font-bold">{formatRupiah(profile.dailyBudget)}</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
              <p className="text-[11px] font-medium text-stone-400">Wilayah</p>
              <p className="mt-0.5 text-sm font-bold leading-6">{profile.region}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Anggota keluarga</p>
            <ul className="mt-2 space-y-2">
              {profile.members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-800"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-stone-500">
                      {member.age} tahun · {GENDER_LABEL[member.gender] ?? member.gender}
                    </p>
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    <p>
                      {member.weightKg} kg ·{" "}
                      {member.heightCm ? `${member.heightCm} cm` : "tinggi belum diisi"}
                    </p>
                    <p>{ACTIVITY_LABEL[member.activityLevel] ?? member.activityLevel}</p>
                  </div>
                  {member.allergies.length > 0 ? (
                    <div className="flex w-full flex-wrap gap-1.5">
                      {member.allergies.map((alergi) => (
                        <Badge key={alergi} tone="danger">
                          {alergi}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold">Preferensi makanan</p>
              {profile.preferences.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.preferences.map((item) => (
                    <Badge key={item} tone="brand">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-stone-500">Belum ada.</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">Pantangan bahan</p>
              {profile.avoidedIngredients.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.avoidedIngredients.map((item) => (
                    <Badge key={item} tone="danger">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-stone-500">Tidak ada.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
            <p className="text-xs text-stone-500">
              Makan {profile.mealsPerDay}x per hari
              {profile.includeSusu ? " · menyertakan susu" : " · tanpa susu"}
            </p>
            <Button intent="primary" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
