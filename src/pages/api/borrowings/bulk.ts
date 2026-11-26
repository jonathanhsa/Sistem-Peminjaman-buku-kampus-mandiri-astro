import type { APIRoute } from 'astro';
import { db, schema } from '../../../db';
import { eq, inArray, sql } from 'drizzle-orm';
import { getCurrentUser } from '../../../lib/auth';
import { calculateDueDate, calculateFine } from '../../../lib/fine';

type BulkBorrowingAction = 'approve' | 'reject' | 'return' | 'pay_fine';

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

  const action = body.action as BulkBorrowingAction;
  const markFinePaid = body.markFinePaid === true;
  const rawIds = Array.isArray(body.ids) ? body.ids : [];
  const ids: number[] = Array.from(
    new Set(rawIds.map((v: any) => parseInt(String(v), 10)).filter((n: number) => Number.isInteger(n) && n > 0))
  );

  if (!action || ids.length === 0) {
    return new Response(JSON.stringify({ error: 'Pilih minimal satu transaksi peminjaman.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const records = await db
    .select()
    .from(schema.borrowings)
    .where(inArray(schema.borrowings.id, ids))
    .all();

  if (records.length === 0) {
    return new Response(JSON.stringify({ error: 'Data peminjaman tidak ditemukan.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let processedCount = 0;
  let skippedCount = 0;
  const now = new Date();
  const nowIso = now.toISOString();

  if (action === 'approve') {
    for (const b of records) {
      if (b.status !== 'pending') {
        skippedCount++;
        continue;
      }

      const item = await db.select().from(schema.items).where(eq(schema.items.id, b.itemId)).get();
      if (!item || item.stock <= 0) {
        skippedCount++;
        continue;
      }

      const dDue = new Date(b.dueDate);
      const dBorrow = new Date(b.borrowDate);
      dDue.setHours(0, 0, 0, 0);
      dBorrow.setHours(0, 0, 0, 0);
      const diffTime = dDue.getTime() - dBorrow.getTime();
      const diffDays = Math.max(1, Math.min(10, Math.round(diffTime / (24 * 60 * 60 * 1000)))) || 7;
      const dueDate = calculateDueDate(now, diffDays);

      await db
        .update(schema.borrowings)
        .set({ status: 'borrowed', borrowDate: nowIso, dueDate })
        .where(eq(schema.borrowings.id, b.id))
        .run();

      await db
        .update(schema.items)
        .set({ stock: sql`stock - 1` })
        .where(eq(schema.items.id, b.itemId))
        .run();

      await db
        .insert(schema.notifications)
        .values({
          userId: b.userId,
          title: 'Peminjaman Disetujui',
          message: `Peminjaman ${item.name} (${b.borrowingCode}) telah disetujui oleh petugas perpustakaan. Silakan ambil buku di loket.`,
          type: 'success',
          isRead: false,
        })
        .run();

      processedCount++;
    }

    if (processedCount === 0) {
      return new Response(
        JSON.stringify({
          error: 'Tidak ada permohonan yang dapat disetujui (pastikan status masih Menunggu dan stok buku tersedia).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        skippedCount,
        message:
          skippedCount > 0
            ? `${processedCount} peminjaman disetujui, ${skippedCount} dilewati (bukan status menunggu atau stok habis).`
            : `${processedCount} peminjaman berhasil disetujui.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'reject') {
    for (const b of records) {
      if (b.status !== 'pending') {
        skippedCount++;
        continue;
      }

      const item = await db.select().from(schema.items).where(eq(schema.items.id, b.itemId)).get();

      await db
        .update(schema.borrowings)
        .set({
          status: 'rejected',
          notes: (b.notes ? b.notes + ' - ' : '') + '[DITOLAK PETUGAS]',
        })
        .where(eq(schema.borrowings.id, b.id))
        .run();

      await db
        .insert(schema.notifications)
        .values({
          userId: b.userId,
          title: 'Pengajuan Ditolak',
          message: `Pengajuan peminjaman ${item?.name || 'buku'} (${b.borrowingCode}) tidak disetujui petugas perpustakaan.`,
          type: 'warning',
          isRead: false,
        })
        .run();

      processedCount++;
    }

    if (processedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Hanya permohonan berstatus Menunggu yang dapat ditolak.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        skippedCount,
        message:
          skippedCount > 0
            ? `${processedCount} permohonan ditolak, ${skippedCount} dilewati.`
            : `${processedCount} permohonan berhasil ditolak.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'return') {
    for (const b of records) {
      if (b.status !== 'borrowed' && b.status !== 'overdue' && b.status !== 'return_pending') {
        skippedCount++;
        continue;
      }

      const { fineAmount } = calculateFine(b.dueDate, now);
      const finalFine = Math.max(b.fineAmount, fineAmount);

      if (finalFine > 0 && !b.finePaidAt && !markFinePaid) {
        skippedCount++;
        continue;
      }

      const finePaidAt = finalFine > 0 ? b.finePaidAt || nowIso : b.finePaidAt;

      await db
        .update(schema.borrowings)
        .set({
          status: 'returned',
          returnDate: nowIso,
          fineAmount: finalFine,
          finePaidAt,
        })
        .where(eq(schema.borrowings.id, b.id))
        .run();

      await db
        .update(schema.items)
        .set({ stock: sql`stock + 1` })
        .where(eq(schema.items.id, b.itemId))
        .run();

      const item = await db.select().from(schema.items).where(eq(schema.items.id, b.itemId)).get();
      await db
        .insert(schema.notifications)
        .values({
          userId: b.userId,
          title: 'Pengembalian Buku Berhasil',
          message: `Buku ${item?.name || ''} (${b.borrowingCode}) telah sukses dikembalikan ke petugas perpustakaan.${
            finalFine > 0 ? ` Denda keterlambatan Rp ${finalFine.toLocaleString('id-ID')} telah lunas.` : ''
          }`,
          type: 'success',
          isRead: false,
        })
        .run();

      processedCount++;
    }

    if (processedCount === 0) {
      return new Response(
        JSON.stringify({
          error: 'Tidak ada peminjaman aktif yang dapat diselesaikan pengembaliannya.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        skippedCount,
        message:
          skippedCount > 0
            ? `${processedCount} buku berhasil dikembalikan, ${skippedCount} dilewati.`
            : `${processedCount} buku berhasil dikonfirmasi pengembaliannya.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'pay_fine') {
    for (const b of records) {
      const { fineAmount } = calculateFine(b.dueDate, now);
      const finalFine = Math.max(b.fineAmount, fineAmount);

      if (finalFine <= 0 || b.finePaidAt) {
        skippedCount++;
        continue;
      }

      await db
        .update(schema.borrowings)
        .set({ fineAmount: finalFine, finePaidAt: nowIso })
        .where(eq(schema.borrowings.id, b.id))
        .run();

      await db
        .insert(schema.notifications)
        .values({
          userId: b.userId,
          title: 'Denda Telah Dilunasi',
          message: `Pembayaran denda untuk transaksi ${b.borrowingCode} telah diverifikasi oleh petugas perpustakaan. Akun Anda kembali bersih.`,
          type: 'success',
          isRead: false,
        })
        .run();

      processedCount++;
    }

    if (processedCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Tidak ada transaksi dengan denda tertunggak pada pilihan Anda.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        skippedCount,
        message:
          skippedCount > 0
            ? `Denda pada ${processedCount} transaksi ditandai lunas, ${skippedCount} dilewati.`
            : `Denda pada ${processedCount} transaksi berhasil ditandai lunas.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ error: 'Aksi massal tidak dikenali.' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
