import Link from "next/link";
import pool from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export default async function AnnouncementListPage() {
  const result = await pool.query(
    `SELECT id, judul, isi, kategori, tanggal_publikasi
     FROM pengumuman
     WHERE status = 'Published'
     ORDER BY tanggal_publikasi DESC, id DESC`
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Pengumuman</h1>

      {result.rows.length === 0 ? (
        <p className="text-slate-400">Belum ada pengumuman.</p>
      ) : (
        <ul className="space-y-3">
          {result.rows.map((item) => (
            <li key={item.id} className="relative rounded-xl bg-slate-900 p-4 hover:ring-2 hover:ring-amber-500">
              <p className="text-xs text-amber-400">
                {ANNOUNCEMENT_CATEGORIES[item.kategori] ?? item.kategori} &middot;{" "}
                {formatDate(item.tanggal_publikasi)}
              </p>
              <h2 className="font-semibold">
                <Link href={`/pengumuman/${item.id}`} className="after:absolute after:inset-0">
                  {item.judul}
                </Link>
              </h2>
              <p className="line-clamp-2 text-sm text-slate-400">{item.isi}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
