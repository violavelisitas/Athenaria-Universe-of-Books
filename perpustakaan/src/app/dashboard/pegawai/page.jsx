import { requireRole } from "@/lib/auth";

export default async function StaffDashboard() {
  const user = await requireRole("pegawai");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold text-amber-400">Staff Dashboard</h1>
      <p className="mt-2">Halo, {user.name}.</p>
    </main>
  );
}