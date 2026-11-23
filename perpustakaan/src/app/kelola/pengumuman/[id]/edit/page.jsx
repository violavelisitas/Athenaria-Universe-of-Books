import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { toDateInputValue } from "@/lib/format";
import AnnouncementForm from "../../AnnouncementForm";
import { updateAnnouncementAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }) {
  await requireRole("admin", "pegawai");

  const { id } = await params;
  const announcementId = parseId(id);
  if (!announcementId) notFound();

  const result = await pool.query(
    `SELECT judul, isi, kategori, tanggal_publikasi, status
     FROM pengumuman WHERE id = $1`,
    [announcementId]
  );
  const item = result.rows[0];
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Edit Pengumuman</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <AnnouncementForm
          action={updateAnnouncementAction.bind(null, announcementId)}
          initialValues={{
            title: item.judul,
            content: item.isi,
            category: item.kategori,
            publishDate: toDateInputValue(item.tanggal_publikasi),
            status: item.status,
          }}
          submitLabel="Simpan perubahan"
        />
      </div>
    </main>
  );
}
