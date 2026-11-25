import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { pickMessage } from "@/lib/messages";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements";
import Notice from "@/components/Notice";
import StatusBadge from "@/components/StatusBadge";
import ConfirmActionButton from "@/components/ConfirmActionButton";
import { deleteAnnouncementAction, togglePublishAction } from "./actions";
import { redirectStaffToDashboard } from "@/lib/auth";


export const dynamic = "force-dynamic";

const MESSAGES = {
  created: ["success", "Pengumuman berhasil dibuat."],
  updated: ["success", "Pengumuman berhasil diperbarui."],
  deleted: ["success", "Pengumuman berhasil dihapus."],
  toggled: ["success", "Status pengumuman berhasil diubah."],
};

export default async function ManageAnnouncementsPage({ searchParams }) {
  await redirectStaffToDashboard();

  await requireRole("admin", "pegawai");
  const params = await searchParams;
  const flash = pickMessage(MESSAGES, params.msg);

  const result = await pool.query(
    `SELECT id, judul, kategori, tanggal_publikasi, status
     FROM pengumuman
     ORDER BY tanggal_publikasi DESC, id DESC`
  );
  const announcements = result.rows;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400">Kelola Pengumuman</h1>
        <Link
          href="/kelola/pengumuman/tambah"
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Tambah Pengumuman
        </Link>
      </div>

      {flash && <Notice tone={flash[0]}>{flash[1]}</Notice>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-3">Judul</th>
              <th className="py-2 pr-3">Kategori</th>
              <th className="py-2 pr-3">Tanggal rilis</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="py-2 pr-3 font-semibold">{item.judul}</td>
                <td className="py-2 pr-3">{ANNOUNCEMENT_CATEGORIES[item.kategori] ?? item.kategori}</td>
                <td className="py-2 pr-3">{formatDate(item.tanggal_publikasi)}</td>
                <td className="py-2 pr-3"><StatusBadge status={item.status} /></td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <ConfirmActionButton
                      action={togglePublishAction.bind(null, item.id)}
                      message={
                        item.status === "Published"
                          ? "Ubah pengumuman ini menjadi Draft? Pengumuman tidak akan tampil di publik."
                          : "Publikasikan pengumuman ini?"
                      }
                      className="text-sm text-green-400 hover:underline"
                    >
                      {item.status === "Published" ? "Jadikan Draft" : "Publikasikan"}
                    </ConfirmActionButton>
                    <Link href={`/kelola/pengumuman/${item.id}/edit`} className="text-sm text-amber-400 hover:underline">
                      Edit
                    </Link>
                    <ConfirmActionButton
                      action={deleteAnnouncementAction.bind(null, item.id)}
                      message={`Hapus pengumuman "${item.judul}"?`}
                    >
                      Hapus
                    </ConfirmActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {announcements.length === 0 && (
          <p className="py-6 text-center text-slate-400">Belum ada pengumuman. Tambahkan yang pertama.</p>
        )}
      </div>
    </main>
  );
}
