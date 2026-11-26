import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { inArray, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '../../../lib/auth';

type BulkItemAction = 'delete' | 'set_available' | 'set_maintenance' | 'add_stock';

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Akses hanya untuk petugas perpustakaan.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Format request tidak valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const action = body.action as BulkItemAction;
  const rawIds = Array.isArray(body.ids) ? body.ids : [];
  const ids: number[] = Array.from(
    new Set(rawIds.map((v: any) => parseInt(String(v), 10)).filter((n: number) => Number.isInteger(n) && n > 0))
  );

  if (!action || ids.length === 0) {
    return new Response(JSON.stringify({ error: 'Pilih minimal satu buku dan tindakan yang valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'set_available' || action === 'set_maintenance') {
    const targetStatus = action === 'set_available' ? 'available' : 'maintenance';
    await db
      .update(schema.items)
      .set({ status: targetStatus })
      .where(inArray(schema.items.id, ids))
      .run();

    const label = targetStatus === 'available' ? 'Tersedia' : 'Perbaikan / Dijilid';
    return new Response(
      JSON.stringify({
        success: true,
        processedCount: ids.length,
        skippedCount: 0,
        message: `${ids.length} buku berhasil diubah statusnya menjadi ${label}.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'add_stock') {
    const delta = parseInt(String(body.stockDelta ?? 1), 10);
    if (isNaN(delta) || delta === 0) {
      return new Response(JSON.stringify({ error: 'Jumlah penambahan stok tidak valid.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db
      .update(schema.items)
      .set({ stock: sql`MAX(0, stock + ${delta})` })
      .where(inArray(schema.items.id, ids))
      .run();

    const verb = delta > 0 ? `ditambah ${delta}` : `dikurangi ${Math.abs(delta)}`;
    return new Response(
      JSON.stringify({
        success: true,
        processedCount: ids.length,
        skippedCount: 0,
        message: `Stok ${ids.length} buku berhasil ${verb} eksemplar.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'delete') {
    // Find which selected items currently have active borrowings
    const activeLoans = await db
      .select({ itemId: schema.borrowings.itemId })
      .from(schema.borrowings)
      .where(
        and(
          inArray(schema.borrowings.itemId, ids),
          inArray(schema.borrowings.status, ['pending', 'borrowed', 'overdue', 'return_pending'])
        )
      )
      .all();

    const blockedIds = new Set(activeLoans.map((l) => l.itemId));
    const deletableIds = ids.filter((id) => !blockedIds.has(id));
    const skippedCount = ids.length - deletableIds.length;

    if (deletableIds.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Semua buku yang dipilih sedang dalam peminjaman aktif sehingga tidak dapat dihapus.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.delete(schema.borrowings).where(inArray(schema.borrowings.itemId, deletableIds)).run();
    await db.delete(schema.items).where(inArray(schema.items.id, deletableIds)).run();

    const msg =
      skippedCount > 0
        ? `${deletableIds.length} buku dihapus. ${skippedCount} buku dilewati karena masih dalam peminjaman aktif.`
        : `${deletableIds.length} buku berhasil dihapus dari katalog.`;

    return new Response(
      JSON.stringify({
        success: true,
        processedCount: deletableIds.length,
        skippedCount,
        message: msg,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ error: 'Aksi massal tidak dikenali.' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
