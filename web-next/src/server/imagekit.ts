import "server-only";

/** Upload/hapus gambar menu lewat ImageKit (khusus server). */

function authHeader(): string | null {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return null;
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}

export function imagekitConfigured(): boolean {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
}

export async function uploadToImageKit(file: File): Promise<{ url: string; fileId: string }> {
  const authorization = authHeader();
  if (!authorization) throw new Error("ImageKit belum dikonfigurasi di server.");

  const body = new FormData();
  body.append("file", file);
  body.append("fileName", `menu-${Date.now()}-${file.name}`);
  body.append("folder", "/nutrivillage/menu");
  body.append("useUniqueFileName", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: authorization },
    body,
  });
  const text = await response.text();
  let data: { url?: string; fileId?: string; message?: string } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    data = {};
  }
  if (!response.ok || !data.url || !data.fileId) {
    throw new Error(
      data.message ?? `ImageKit gagal mengunggah (HTTP ${response.status}). Periksa private key.`,
    );
  }
  return { url: data.url, fileId: data.fileId };
}
