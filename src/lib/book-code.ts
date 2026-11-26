/**
 * Utility untuk membuat kode unik buku secara otomatis:
 * Format: LIB-<INISIAL>-<URUTAN>
 * Contoh: Judul "Aaa Bbbb Ccc" urutan ke-12 -> "LIB-ABC-012"
 */

export function extractBookInitials(title: string): string {
  const cleaned = (title || '')
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/_/g, ' ')
    .trim();

  const words = cleaned
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 0);

  if (words.length === 0) return 'BUK';

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  // Ambil huruf pertama dari setiap kata (maksimal 4 kata agar kode tetap ringkas)
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function formatBookCode(title: string, sequenceNumber: number): string {
  const initials = extractBookInitials(title);
  const seq = String(Math.max(1, Math.floor(sequenceNumber))).padStart(3, '0');
  return `LIB-${initials}-${seq}`;
}

export function getNextBookSequence(existingItems: Array<{ id: number; itemCode: string }>): number {
  let maxSeq = existingItems.length;

  for (const item of existingItems) {
    if (item.id > maxSeq) maxSeq = item.id;
    const match = item.itemCode.match(/-(\d+)$/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  return maxSeq + 1;
}
