import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-amber-400">
          Masuk ke Athenaria
        </h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="text-amber-400 hover:underline">
            Daftar sebagai mahasiswa
          </Link>
        </p>
      </div>
    </main>
  );
}