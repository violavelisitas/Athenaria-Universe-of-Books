import { requireRole } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import AnnouncementForm from "../AnnouncementForm";
import { createAnnouncementAction } from "../actions";

export default async function AddAnnouncementPage() {
  await requireRole("admin", "pegawai");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Tambah Pengumuman</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <AnnouncementForm
          action={createAnnouncementAction}
          initialValues={{
            title: "",
            content: "",
            category: "",
            publishDate: toDateInputValue(),
            status: "Draft",
          }}
          submitLabel="Simpan pengumuman"
        />
      </div>
    </main>
  );
}
