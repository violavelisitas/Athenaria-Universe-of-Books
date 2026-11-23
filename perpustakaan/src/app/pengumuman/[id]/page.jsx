import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/helpers";
import { formatDate } from "@/lib/format";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }) {
  const { id } = await params;
  const announcementId = parseId(id);
  if (!announcementId) notFound();

  // A draft returns no row, so visitors get a 404 instead of the content.
  const result = await pool.query(
    `SELECT judul, isi, kategori, tanggal_publikasi
     FROM pengumuman
     WHERE id = $1 AND status = 'Published'`,
    [announcementId]
  );
  const item = result.rows[0];
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <Link href="/pengumuman" className="text-sm text-amber-400 hover:underline">
        Kembali ke pengumuman
      </Link>
      <article className="mt-4 rounded-2xl bg-slate-900 p-6">
        <p className="text-xs text-amber-400">
          {ANNOUNCEMENT_CATEGORIES[item.kategori] ?? item.kategori} &middot;{" "}
          {formatDate(item.tanggal_publikasi)}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{item.judul}</h1>
        <p className="mt-4 whitespace-pre-line text-slate-300">{item.isi}</p>
      </article>
    </main>
  );
}
