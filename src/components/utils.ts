/**
 * utils.ts
 * Helper internal komponen: penggabung className dan escaper HTML.
 */

export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | readonly ClassValue[];

const flattenClass = (value: ClassValue): string => {
  if (value === false || value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return value
    .map(flattenClass)
    .filter((item) => item.length > 0)
    .join(' ');
};

/** Menggabungkan kelas Tailwind ala `clsx` tanpa dependency tambahan. */
export const cn = (...values: readonly ClassValue[]): string =>
  values
    .map(flattenClass)
    .filter((item) => item.length > 0)
    .join(' ');

/** Format angka menjadi mata uang Rupiah tanpa desimal. */
export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

/** Mencegah XSS saat menyisipkan data dinamis ke dalam template HTML. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
