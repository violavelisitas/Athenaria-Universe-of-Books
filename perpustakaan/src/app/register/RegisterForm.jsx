"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";

function FormField({ id, label, type = "text", error, defaultValue }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-slate-300">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg bg-white px-3 py-2 text-black"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} noValidate className="space-y-4">
      <FormField
        id="name"
        label="Nama lengkap"
        error={errors.name}
        defaultValue={values.name ?? ""}
      />
      <FormField
        id="email"
        label="Email kampus"
        type="email"
        error={errors.email}
        defaultValue={values.email ?? ""}
      />
      <FormField
        id="studentId"
        label="NIM"
        error={errors.studentId}
        defaultValue={values.studentId ?? ""}
      />
      <FormField
        id="password"
        label="Password (min. 8 karakter)"
        type="password"
        error={errors.password}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}