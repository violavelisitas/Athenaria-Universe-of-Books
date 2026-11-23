"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { createSession,destroySession } from "@/lib/auth";

export async function loginAction(previousState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      errors: { general: "Email dan password wajib diisi" },
      values: { email },
    };
  }

  const result = await pool.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email]
  );
  
  const user = result.rows[0];
  
  const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : false;
  
  if (!isMatch) {
    return {
      errors: { general: "Email atau password salah"},
      values: { email },
    }; 
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}