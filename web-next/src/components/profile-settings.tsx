"use client";

import { Bell, Check, KeyRound, LogOut, Save, ShieldCheck, User, Users } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Chip, optionsWith, toggleListItem } from "@/components/chip";
import { PasswordChecklist } from "@/components/password-checklist";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FieldError,
  Input,
  Label,
  PasswordInput,
  Switch,
} from "@/components/ui";
import {
  useAccount,
  useChangePasswordMutation,
  useUpdateAccountMutation,
} from "@/hooks/use-account";
import { useProfile, useSaveProfileMutation } from "@/hooks/use-profile";
import { initialsOf, useSession } from "@/hooks/use-session";
import { formatRupiah } from "@/lib/utils";
import { AccountUpdateSchema, PasswordChangeSchema } from "@/schemas/account";
import { ALLERGY_OPTIONS, PREFERENCE_OPTIONS } from "@/schemas/explore";

/**
 * FR-18 (data diri), FR-19 (preferensi), FR-21 (notifikasi): halaman Profil.
 *
 * Data diri & notifikasi disimpan di database lewat `/api/account`;
 * data keluarga & preferensi disimpan lewat `/api/profile`.
 */

const ROLE_LABEL: Readonly<Record<string, string>> = {
  user: "Masyarakat",
  petugas_sppg: "Petugas SPPG",
  admin: "Admin",
  guest: "Tamu",
};

const AGE_GROUP_LABEL: Readonly<Record<string, string>> = {
  balita: "Balita",
  anak: "Anak",
  dewasa: "Dewasa",
  lansia: "Lansia",
};

/** Ikon centang untuk umpan balik "Tersimpan". */
function SavedFlag({ show }: { readonly show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
    >
      <Check className="size-3.5" aria-hidden="true" /> Tersimpan
    </span>
  );
}

const toggle = toggleListItem;

export function ProfileSettings() {
  const { data: sessionUser } = useSession();
  const accountQuery = useAccount();
  const updateAccount = useUpdateAccountMutation();
  const changePassword = useChangePasswordMutation();
  const profileQuery = useProfile();
  const saveProfile = useSaveProfileMutation();

  const account = accountQuery.data;
  const profile = profileQuery.data;
  const isGuest = !accountQuery.isLoading && account === null;

  /* --- Data diri ---------------------------------------------------- */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setPhone(account.phone);
    }
  }, [account]);

  /* --- Preferensi & pantangan --------------------------------------- */
  const [preferences, setPreferences] = useState<string[]>([]);
  const [avoided, setAvoided] = useState<string[]>([]);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setPreferences([...profile.preferences]);
      setAvoided([...profile.avoidedIngredients]);
    }
  }, [profile]);

  /* --- Ganti password ----------------------------------------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaved, setPwdSaved] = useState(false);

  const handleSaveAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountError(null);
    setAccountSaved(false);

    const parsed = AccountUpdateSchema.safeParse({ name, phone });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const message = issue?.message ?? "Periksa kembali isian Anda.";
      if (issue?.path[0] === "phone") setPhoneError(message);
      else setNameError(message);
      return;
    }
    setNameError(null);
    setPhoneError(null);

    updateAccount.mutate(parsed.data, {
      onSuccess: () => setAccountSaved(true),
      onError: (error) => setAccountError(error.message),
    });
  };

  const handleToggleNotif = (checked: boolean) => {
    setNotifSaved(false);
    updateAccount.mutate(
      { notificationsEnabled: checked },
      {
        onSuccess: () => setNotifSaved(true),
        onError: (error) => setAccountError(error.message),
      },
    );
  };

  const handleSavePreferences = () => {
    if (!profile) return;
    setPrefError(null);
    setPrefSaved(false);
    saveProfile.mutate(
      {
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
      },
      {
        onSuccess: () => setPrefSaved(true),
        onError: (error) => setPrefError(error.message),
      },
    );
  };

  const handleChangePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPwdError(null);
    setPwdSaved(false);

    const parsed = PasswordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setPwdErrors(next);
      setPwdError("Periksa kembali isian yang ditandai merah.");
      return;
    }
    if (parsed.data.newPassword !== parsed.data.confirmPassword) {
      setPwdErrors({ confirmPassword: "Konfirmasi password tidak sama." });
      setPwdError("Konfirmasi password tidak sama.");
      return;
    }
    if (!/[A-Za-z]/.test(parsed.data.newPassword) || !/[0-9]/.test(parsed.data.newPassword)) {
      setPwdErrors({ newPassword: "Password baru harus memuat huruf dan angka." });
      setPwdError("Password baru harus memuat huruf dan angka.");
      return;
    }

    setPwdErrors({});
    changePassword.mutate(parsed.data, {
      onSuccess: () => {
        setPwdSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (error) => setPwdError(error.message),
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  };

  const displayName = account?.name ?? sessionUser?.name ?? "Pengguna";
  const displayEmail = account?.email ?? sessionUser?.email ?? "—";
  const roleLabel = ROLE_LABEL[sessionUser?.role ?? ""] ?? "Pengguna";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Ringkasan profil */}
      <Card className="lg:col-span-2">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white"
            >
              {initialsOf(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-50">{displayName}</p>
              <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
                {displayEmail}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="brand">{roleLabel}</Badge>
                {isGuest ? <Badge tone="neutral">Mode Tamu</Badge> : null}
              </div>
            </div>
            {profile ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-stone-400">Anggota</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profile.members.length} orang
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Budget</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {formatRupiah(profile.dailyBudget)}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-stone-400">Wilayah</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profile.region}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Data diri (FR-18) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-brand-600" aria-hidden="true" /> Data Diri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountQuery.isLoading ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Memuat data akun…</p>
          ) : isGuest ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Anda masuk sebagai <b>Tamu</b>. Mode tamu tidak menyimpan data diri maupun notifikasi
                ke database. Masuk dengan akun untuk menyimpannya.
              </p>
              <ButtonLink href="/login">Masuk / Daftar</ButtonLink>
            </div>
          ) : (
            <form onSubmit={handleSaveAccount} className="space-y-4" noValidate>
              {accountError ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
                >
                  {accountError}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nama lengkap</Label>
                <Input
                  id="profile-name"
                  value={name}
                  invalid={Boolean(nameError)}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                    setAccountSaved(false);
                  }}
                />
                <FieldError>{nameError}</FieldError>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={displayEmail} readOnly disabled />
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Email dipakai untuk masuk sehingga tidak dapat diubah di halaman ini.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Nomor HP (opsional)</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  placeholder="0812xxxxxxx"
                  invalid={Boolean(phoneError)}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setPhoneError(null);
                    setAccountSaved(false);
                  }}
                />
                <FieldError>{phoneError}</FieldError>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  10-15 digit angka; boleh diawali +62.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={updateAccount.isPending}>
                  <Save className="size-4" aria-hidden="true" /> Simpan Data Diri
                </Button>
                <SavedFlag show={accountSaved} />
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Data keluarga (FR-05) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-brand-600" aria-hidden="true" /> Data Keluarga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileQuery.isPending ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Memuat data keluarga…</p>
          ) : profile ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-400">Anggota</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profile.members.length} orang
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Budget harian</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {formatRupiah(profile.dailyBudget)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-stone-400">Wilayah</dt>
                  <dd className="font-semibold text-stone-800 dark:text-stone-100">
                    {profile.region}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                  Daftar anggota
                </p>
                <ul className="space-y-2">
                  {profile.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-stone-50 px-3 py-2 text-sm dark:bg-stone-800/60"
                    >
                      <span className="font-semibold text-stone-800 dark:text-stone-100">
                        {member.name}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        • {member.age} tahun
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        • {AGE_GROUP_LABEL[member.ageGroup] ?? member.ageGroup}
                      </span>
                      {member.allergies.length > 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          • alergi: {member.allergies.join(", ")}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <ButtonLink intent="secondary" href="/onboarding?edit=1">
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

      {/* Preferensi & pantangan (FR-19) */}
      <Card>
        <CardHeader>
          <CardTitle>Preferensi &amp; Pantangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profile ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Isi data keluarga terlebih dahulu untuk mengatur preferensi.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                  Preferensi makanan
                </span>
                <div className="flex flex-wrap gap-2">
                  {optionsWith(PREFERENCE_OPTIONS, preferences).map((option) => (
                    <Chip
                      key={option}
                      active={preferences.includes(option)}
                      onClick={() => {
                        setPreferences((current) => toggle(current, option));
                        setPrefSaved(false);
                      }}
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                  Bahan yang dihindari (alergi/pantangan)
                </span>
                <div className="flex flex-wrap gap-2">
                  {optionsWith(ALLERGY_OPTIONS, avoided).map((option) => (
                    <Chip
                      key={option}
                      danger
                      active={avoided.includes(option)}
                      onClick={() => {
                        setAvoided((current) => toggle(current, option));
                        setPrefSaved(false);
                      }}
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>

              {prefError ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {prefError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  intent="secondary"
                  loading={saveProfile.isPending}
                  onClick={handleSavePreferences}
                >
                  <Save className="size-4" aria-hidden="true" /> Simpan Preferensi
                </Button>
                <SavedFlag show={prefSaved} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pengaturan akun (FR-21) */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* Notifikasi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
                <Bell className="size-4 text-brand-600" aria-hidden="true" /> Notifikasi
              </span>
              <div className="flex items-center gap-3">
                <SavedFlag show={notifSaved} />
                <Switch
                  checked={account?.notificationsEnabled ?? true}
                  disabled={isGuest || accountQuery.isLoading}
                  onCheckedChange={handleToggleNotif}
                  aria-label="Aktifkan notifikasi"
                />
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isGuest
                ? "Mode tamu tidak menyimpan preferensi notifikasi."
                : "Sakelar disimpan ke akun Anda. Saat dimatikan, daftar notifikasi akan kosong."}
            </p>

            <div className="border-t border-stone-100 pt-4 dark:border-stone-800">
              <Button intent="danger" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" /> Keluar dari Akun
              </Button>
            </div>
          </div>

          {/* Ganti password */}
          <form onSubmit={handleChangePassword} className="space-y-3" noValidate>
            <p className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
              <KeyRound className="size-4 text-brand-600" aria-hidden="true" /> Ganti Password
            </p>

            {isGuest ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Mode tamu tidak memiliki password.
              </p>
            ) : (
              <>
                {pwdError ? (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
                  >
                    {pwdError}
                  </p>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="pwd-current">Password lama</Label>
                  <PasswordInput
                    id="pwd-current"
                    autoComplete="current-password"
                    value={currentPassword}
                    invalid={Boolean(pwdErrors.currentPassword)}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPwdSaved(false);
                    }}
                  />
                  <FieldError>{pwdErrors.currentPassword}</FieldError>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pwd-new">Password baru</Label>
                  <PasswordInput
                    id="pwd-new"
                    autoComplete="new-password"
                    aria-describedby="pwd-new-rules"
                    value={newPassword}
                    invalid={Boolean(pwdErrors.newPassword)}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setPwdSaved(false);
                    }}
                  />
                  <PasswordChecklist id="pwd-new-rules" value={newPassword} className="pt-0.5" />
                  <FieldError>{pwdErrors.newPassword}</FieldError>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pwd-confirm">Ulangi password baru</Label>
                  <PasswordInput
                    id="pwd-confirm"
                    autoComplete="new-password"
                    value={confirmPassword}
                    invalid={Boolean(pwdErrors.confirmPassword)}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPwdSaved(false);
                    }}
                  />
                  <FieldError>{pwdErrors.confirmPassword}</FieldError>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" intent="secondary" loading={changePassword.isPending}>
                    <ShieldCheck className="size-4" aria-hidden="true" /> Ganti Password
                  </Button>
                  <SavedFlag show={pwdSaved} />
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
