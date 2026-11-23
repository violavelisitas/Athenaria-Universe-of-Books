import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function StaffDashboard() {
  const user = await requireRole("pegawai");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">

      <h1 className="text-2xl font-bold text-amber-400">Staff Dashboard</h1>
      <p className="mt-2">Halo, {user.name}.</p>

      <Link
      href="/kelola/buku"
      className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900"
      >
        Kelola Buku
      </Link>

    </main>
  );
}