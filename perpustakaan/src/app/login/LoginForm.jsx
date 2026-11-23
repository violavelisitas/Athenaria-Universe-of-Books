"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state?.errors?.general && (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
          {state.errors.general}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state?.values?.email ?? ""}
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </button>

      <Link
        href="/"
        className="block w-full rounded-lg border border-slate-600 py-2 text-center text-slate-200 hover:bg-slate-800"
      >
        Continue as Guest
      </Link>
    </form>
  );
}