import "server-only";

/**
 * FR-35: pembatasan Generate Explore maksimal 5 kali per jam per akun.
 * Implementasi in-memory (simulasi) dengan jendela waktu bergulir tetap.
 */

const WINDOW_MS = 60 * 60 * 1000;
export const MAX_GENERATE_PER_HOUR = 5;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface QuotaResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly limit: number;
  readonly resetAt: number;
}

/** Mengonsumsi satu kuota generate untuk `key` (userId atau identifier lain). */
export function consumeGenerateQuota(key: string): QuotaResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_GENERATE_PER_HOUR - 1, limit: MAX_GENERATE_PER_HOUR, resetAt };
  }

  if (bucket.count >= MAX_GENERATE_PER_HOUR) {
    return { allowed: false, remaining: 0, limit: MAX_GENERATE_PER_HOUR, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_GENERATE_PER_HOUR - bucket.count,
    limit: MAX_GENERATE_PER_HOUR,
    resetAt: bucket.resetAt,
  };
}
