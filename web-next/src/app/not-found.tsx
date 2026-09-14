import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Periksa kembali tautan Anda atau kembali ke halaman utama NutriVillage AI.
      </p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/">Beranda</ButtonLink>
        <ButtonLink intent="secondary" href="/explore">
          Explore Menu
        </ButtonLink>
      </div>
    </div>
  );
}
