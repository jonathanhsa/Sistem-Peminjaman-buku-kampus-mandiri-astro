import type { APIRoute } from 'astro';
import { db, schema } from '../../../../db';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '../../../../lib/auth';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const user = await getCurrentUser(cookies);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Akses ditolak.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id || '0', 10);
  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim() || '';
  const category = 'Buku Perpustakaan';
  const stock = Math.max(0, parseInt(formData.get('stock')?.toString() || '0', 10) || 0);
  const status = (formData.get('status')?.toString() || 'available') as 'available' | 'borrowed' | 'maintenance';

  if (!name) {
    return new Response(JSON.stringify({ error: 'Judul buku tidak boleh kosong.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updateData: Record<string, any> = {
    name,
    category,
    stock,
    status,
  };

  if (formData.has('author')) {
    updateData.author = formData.get('author')?.toString().trim() || null;
  }
  if (formData.has('publisher')) {
    updateData.publisher = formData.get('publisher')?.toString().trim() || null;
  }
  if (formData.has('publicationYear')) {
    const rawYear = formData.get('publicationYear')?.toString().trim() || '';
    const parsedYear = rawYear ? parseInt(rawYear, 10) : null;
    updateData.publicationYear = parsedYear && !isNaN(parsedYear) ? parsedYear : null;
  }

  await db.update(schema.items)
    .set(updateData)
    .where(eq(schema.items.id, id))
    .run();

  return redirect('/admin/barang', 302);
};
