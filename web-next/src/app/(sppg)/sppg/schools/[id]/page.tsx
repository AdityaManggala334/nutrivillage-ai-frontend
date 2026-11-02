import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchoolDetail } from "@/components/sppg/school-detail";

export const metadata: Metadata = {
  title: "Detail Sekolah",
  description: "Kelola kelompok penerima manfaat dan jumlah siswa pada sekolah ini.",
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

/** FR-11: detail sekolah + kelompok penerima manfaat. */
export default async function SppgSchoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const schoolId = Number(id);
  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    notFound();
  }
  return <SchoolDetail schoolId={schoolId} />;
}
