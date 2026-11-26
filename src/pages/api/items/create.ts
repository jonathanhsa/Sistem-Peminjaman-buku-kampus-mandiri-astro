import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '../../../lib/auth';
import { formatBookCode, getNextBookSequence } from '../../../lib/book-code';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await getCurrentUser(cookies);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Akses ditolak.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim() || '';
  const author = formData.get('author')?.toString().trim() || null;
  const publisher = formData.get('publisher')?.toString().trim() || null;
  const pubYearRaw = formData.get('publicationYear')?.toString().trim() || '';
  const parsedYear = pubYearRaw ? parseInt(pubYearRaw, 10) : null;
  const publicationYear = parsedYear && !isNaN(parsedYear) ? parsedYear : null;
  const category = 'Buku Perpustakaan';
  const stock = Math.max(0, parseInt(formData.get('stock')?.toString() || '0', 10) || 0);
  const status = (formData.get('status')?.toString() || 'available') as 'available' | 'borrowed' | 'maintenance';

  if (!name) {
    return redirect('/admin/barang/create?error=' + encodeURIComponent('Judul buku wajib diisi.'), 302);
  }

  // Generate unique book code automatically: LIB-<INISIAL>-<URUTAN>
  const existingItems = await db
    .select({ id: schema.items.id, itemCode: schema.items.itemCode })
    .from(schema.items)
    .all();

  let seq = getNextBookSequence(existingItems);
  let itemCode = formatBookCode(name, seq);

  // Guarantee uniqueness even in concurrent inserts
  while (await db.select({ id: schema.items.id }).from(schema.items).where(eq(schema.items.itemCode, itemCode)).get()) {
    seq++;
    itemCode = formatBookCode(name, seq);
  }

  await db.insert(schema.items)
    .values({
      itemCode,
      name,
      author,
      publisher,
      publicationYear,
      category,
      stock,
      status,
    })
    .run();

  return redirect('/admin/barang', 302);
};
