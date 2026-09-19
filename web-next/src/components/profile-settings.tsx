"use client";

import { Bell, Globe, LogOut, Save, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, ButtonLink, Card, CardContent, CardHeader, CardTitle, FieldError, Input, Label, Select, Switch } from "@/components/ui";
import { useAccount, useUpdateAccountMutation } from "@/hooks/use-account";
import { useProfile, useSaveProfileMutation } from "@/hooks/use-profile";
import { useUIStore } from "@/stores/ui-store";
import { formatRupiah } from "@/lib/utils";

/** FR-18, FR-19, FR-21: halaman profil & pengaturan akun. */
export function ProfileSettings() {
  const router = useRouter();
  const themeMode = useUIStore((state) => state.themeMode);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const accountQuery = useAccount();
  const updateAccount = useUpdateAccountMutation();
  const profileQuery = useProfile();
  const saveProfile = useSaveProfileMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState("");
  const [avoided, setAvoided] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [language, setLanguage] = useState("id");

  useEffect(() => {
    if (accountQuery.data) {
      setName(accountQuery.data.name);
      setEmail(accountQuery.data.email);
      setPhone(accountQuery.data.phone);
    }
  }, [accountQuery.data]);

  useEffect(() => {
    if (profileQuery.data) {
      setPreferences(profileQuery.data.preferences.join(", "));
      setAvoided(profileQuery.data.avoidedIngredients.join(", "));
    }
  }, [profileQuery.data]);

  const handleSaveAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountError(null);
    updateAccount.mutate(
      { name, email, phone },
      { onError: (error) => setAccountError(error.message) },
    );
  };

  const handleSavePreferences = () => {
    const profile = profileQuery.data;
    if (!profile) return;
    saveProfile.mutate({
      dailyBudget: profile.dailyBudget,
      region: profile.region,
      preferences,
      avoidedIngredients: avoided,
      members: profile.members.map((member) => ({
        name: member.name,
        age: String(member.age),
        gender: member.gender,
        weightKg: String(member.weightKg),
        activityLevel: member.activityLevel,
        allergies: member.allergies.join(", "),
      })),
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Data diri (FR-18) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-brand-600" aria-hidden="true" /> Data Diri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAccount} className="space-y-4" noValidate>
            {accountError ? (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                {accountError}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nama lengkap</Label>
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Nomor HP</Label>
              <Input id="profile-phone" value={phone} placeholder="0812xxxxxxx" onChange={(event) => setPhone(event.target.value)} />
            </div>
            <Button type="submit" loading={updateAccount.isPending}>
              <Save className="size-4" aria-hidden="true" /> Simpan Data Diri
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data keluarga (FR-18) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-brand-600" aria-hidden="true" /> Data Keluarga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileQuery.isPending ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Memuat data keluarga...</p>
          ) : profileQuery.data ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-400">Anggota</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profileQuery.data.members.length} orang
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Budget harian</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {formatRupiah(profileQuery.data.dailyBudget)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Wilayah</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profileQuery.data.region}
                  </dd>
                </div>
              </dl>
              <ButtonLink intent="secondary" href="/onboarding">
                Ubah Data Keluarga
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Data keluarga belum diisi.
              </p>
              <ButtonLink href="/onboarding">Isi Data Keluarga</ButtonLink>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preferensi & tujuan (FR-19) */}
      <Card>
        <CardHeader>
          <CardTitle>Preferensi &amp; Pantangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-pref">Preferensi makanan</Label>
            <Input
              id="profile-pref"
              value={preferences}
              placeholder="sayur, ikan"
              onChange={(event) => setPreferences(event.target.value)}
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">Pisahkan dengan koma.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-avoided">Bahan yang dihindari</Label>
            <Input
              id="profile-avoided"
              value={avoided}
              placeholder="kacang, seafood"
              onChange={(event) => setAvoided(event.target.value)}
            />
            <FieldError />
          </div>
          <Button
            intent="secondary"
            loading={saveProfile.isPending}
            disabled={!profileQuery.data}
            onClick={handleSavePreferences}
          >
            <Save className="size-4" aria-hidden="true" /> Simpan Preferensi
          </Button>
          {!profileQuery.data ? (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Isi data keluarga lebih dulu untuk menyimpan preferensi.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Pengaturan akun (FR-21) */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-stone-700 dark:text-stone-200">Tema tampilan</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
              <Bell className="size-4 text-brand-600" aria-hidden="true" /> Notifikasi
            </span>
            <Switch
              checked={notifEnabled}
              onCheckedChange={setNotifEnabled}
              aria-label="Aktifkan notifikasi"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
              <Globe className="size-4 text-brand-600" aria-hidden="true" /> Bahasa
            </span>
            <Select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-36 sm:w-40">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </Select>
          </div>
          <div className="border-t border-stone-100 pt-4 dark:border-stone-800">
            <Button intent="danger" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" /> Keluar dari Akun
            </Button>
          </div>
          <p className="text-xs text-stone-400">
            Tema aktif: {themeMode === "dark" ? "Gelap" : "Terang"}. Notifikasi &amp; bahasa
            bersifat pengaturan tampilan pada versi ini.
          </p>
          <Button intent="ghost" size="sm" onClick={toggleTheme}>
            Ganti tema cepat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
