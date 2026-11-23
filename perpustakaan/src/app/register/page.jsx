import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-amber-400">
          Daftar Mahasiswa
        </h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}