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

export const createId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Hash sederhana (djb2) untuk SIMULASI penyimpanan password.
 * Bukan pengganti bcrypt; hanya agar password tidak disimpan sebagai teks polos.
 */
export const mockHash = (value: string): string => {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
