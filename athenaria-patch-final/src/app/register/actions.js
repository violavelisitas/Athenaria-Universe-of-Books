"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { createSession } from "@/lib/auth";
import { isValidEmail, isCampusEmail } from "@/lib/validation";

export async function registerAction(previousState, formData) {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    studentId: String(formData.get("studentId") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");

  // 1. Server-side validation (browser checks can be bypassed)
  const errors = {};
  if (values.name.length < 3) errors.name = "Nama minimal 3 karakter.";
  if (!isValidEmail(values.email)) {
    errors.email = "Format email tidak valid.";
  } else if (!isCampusEmail(values.email)) {
    errors.email =
      "Gunakan email kampus berakhiran .ac.id (contoh: nim@student.unhas.ac.id).";
  }
  if (!/^[A-Za-z0-9]{6,20}$/.test(values.studentId)) {
    errors.studentId = "NIM hanya huruf/angka, 6 sampai 20 karakter.";
  }
  if (password.length < 8) errors.password = "Password minimal 8 karakter.";
  if (Object.keys(errors).length > 0) return { errors, values };

  // 2. Make sure the email and student ID are not taken yet
  const existing = await pool.query(
    "SELECT email, nim FROM users WHERE email = $1 OR nim = $2",
    [values.email, values.studentId]
  );
  for (const row of existing.rows) {
    if (row.email === values.email) errors.email = "Email sudah terdaftar.";
    if (row.nim === values.studentId) errors.studentId = "NIM sudah terdaftar.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };

  // 3. Insert. The role is fixed to 'mahasiswa' on the server and never read
  //    from the form, so nobody can register as admin.
  const passwordHash = await bcrypt.hash(password, 10);
  let userId;
  try {
    const result = await pool.query(
      `INSERT INTO users (nama, email, password, role, nim)
       VALUES ($1, $2, $3, 'mahasiswa', $4) RETURNING id`,
      [values.name, values.email, passwordHash, values.studentId]
    );
    userId = result.rows[0].id;
  } catch (error) {
    // 23505 = UNIQUE violation (two people registering at the same time)
    if (error.code === "23505") {
      return {
        errors: { email: "Email atau NIM sudah terdaftar." },
        values,
      };
    }
    throw error;
  }

  await createSession(userId);
  redirect("/dashboard"); // redirect must stay outside try/catch
}
