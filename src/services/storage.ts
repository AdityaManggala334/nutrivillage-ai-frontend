/**
 * storage.ts
 * Helper mock API: delay jaringan, localStorage bertipe, dan ID generator.
 * Semua data disimulasikan secara lokal (tanpa API sungguhan).
 */

export const STORAGE_KEYS = {
  users: 'nvai:users',
  session: 'nvai:session',
  profile: 'nvai:profile',
} as const;

/** Simulasi latensi jaringan. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
};

export const writeJson = <T>(key: string, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removeKey = (key: string): void => {
  window.localStorage.removeItem(key);
};

/** Generator ID unik berbasis Web Crypto (aman secara kriptografis). */
export const createId = (prefix: string): string => `${prefix}_${crypto.randomUUID()}`;

/**
 * Hash password untuk SIMULASI memakai Web Crypto (SHA-256 + salt demo).
 * Catatan: pada aplikasi produksi, hashing password wajib dilakukan di sisi
 * server dengan algoritma lambat seperti bcrypt/argon2, bukan di browser.
 */
export const mockHash = async (value: string): Promise<string> => {
  const data = new TextEncoder().encode(`nvai-demo-salt:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
