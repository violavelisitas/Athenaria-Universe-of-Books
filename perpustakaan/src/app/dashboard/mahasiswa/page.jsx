import { requireRole } from "@/lib/auth";

export default async function StudentDashboard() {
  const user = await requireRole("mahasiswa");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold text-amber-400">Student Dashboard</h1>
      <p className="mt-2">Halo, {user.name}.</p>
    </main>
  );
}