"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { isValidEmail } from "@/lib/validation";
import { withTransaction } from "@/lib/transaction";

const LIST_PATH = "/admin/user";
const ROLES = ["admin", "pegawai", "mahasiswa"];

// isCreate: password is required on create, optional on edit
// (leave it empty to keep the current password).
function readUserForm(formData, isCreate) {
  const text = (field) => String(formData.get(field) ?? "").trim();

  const values = {
    name: text("name"),
    email: text("email").toLowerCase(),
    role: text("role"),
    identityNumber: text("identityNumber"),
  };
  const password = String(formData.get("password") ?? "");

  const errors = {};
  if (values.name.length < 3) errors.name = "Nama minimal 3 karakter.";
  if (!isValidEmail(values.email)) errors.email = "Format email tidak valid.";
  if (!ROLES.includes(values.role)) errors.role = "Pilih role.";

  // Students must have an ID number (NIM). Staff and admins may leave it empty.
  const idPattern = /^[A-Za-z0-9]{6,20}$/;
  if (values.role === "mahasiswa" && !values.identityNumber) {
    errors.identityNumber = "NIM wajib diisi untuk mahasiswa.";
  } else if (values.identityNumber && !idPattern.test(values.identityNumber)) {
    errors.identityNumber = "Nomor identitas hanya huruf/angka, 6 sampai 20 karakter.";
  }

  if (isCreate && password.length < 8) {
    errors.password = "Password minimal 8 karakter.";
  } else if (!isCreate && password !== "" && password.length < 8) {
    errors.password = "Password baru minimal 8 karakter.";
  }

  return { values, errors, password };
}

async function findDuplicateErrors(values, excludeId = null) {
  const result = await pool.query(
    `SELECT email, nim FROM users
     WHERE (email = $1 OR ($2::text IS NOT NULL AND nim = $2))
       AND ($3::int IS NULL OR id <> $3)`,
    [values.email, values.identityNumber || null, excludeId]
  );

  const errors = {};
  for (const row of result.rows) {
    if (row.email === values.email) errors.email = "Email sudah terdaftar.";
    if (values.identityNumber && row.nim === values.identityNumber) {
      errors.identityNumber = "Nomor identitas sudah terdaftar.";
    }
  }
  return errors;
}

export async function createUserAction(previousState, formData) {
  await requireRole("admin");

  const { values, errors, password } = readUserForm(formData, true);
  if (Object.keys(errors).length > 0) return { errors, values };

  const duplicateErrors = await findDuplicateErrors(values);
  if (Object.keys(duplicateErrors).length > 0) return { errors: duplicateErrors, values };

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO users (nama, email, password, role, nim)
       VALUES ($1, $2, $3, $4, $5)`,
      [values.name, values.email, passwordHash, values.role, values.identityNumber || null]
    );
  } catch (error) {
    if (error.code === "23505") {
      return { errors: { email: "Email atau nomor identitas sudah terdaftar." }, values };
    }
    throw error;
  }

  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}?msg=created`);
}

// Bound with .bind(null, userId) in the edit page.
export async function updateUserAction(id, previousState, formData) {
  const admin = await requireRole("admin");

  const userId = parseId(id);
  if (!userId) redirect(LIST_PATH);

  const { values, errors, password } = readUserForm(formData, false);

  // An admin cannot change their own role (it could lock everyone out).
  if (userId === admin.id && values.role !== admin.role) {
    errors.role = "Kamu tidak dapat mengubah role akunmu sendiri.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };

  const duplicateErrors = await findDuplicateErrors(values, userId);
  if (Object.keys(duplicateErrors).length > 0) return { errors: duplicateErrors, values };

  try {
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users
         SET nama = $1, email = $2, role = $3, nim = $4, password = $5
         WHERE id = $6`,
        [values.name, values.email, values.role, values.identityNumber || null, passwordHash, userId]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET nama = $1, email = $2, role = $3, nim = $4
         WHERE id = $5`,
        [values.name, values.email, values.role, values.identityNumber || null, userId]
      );
    }
  } catch (error) {
    if (error.code === "23505") {
      return { errors: { email: "Email atau nomor identitas sudah terdaftar." }, values };
    }
    throw error;
  }

  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}?msg=updated`);
}

export async function deleteUserAction(id) {
  const admin = await requireRole("admin");

  const userId = parseId(id);
  if (!userId) redirect(LIST_PATH);

  // Rule 1: an admin cannot delete their own account.
  if (userId === admin.id) redirect(`${LIST_PATH}?msg=self`);

  // Rule 2: a user with an active request or loan cannot be deleted.
  const active = await pool.query(
    `SELECT 1 FROM transaksi
     WHERE peminjam_id = $1 AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
     LIMIT 1`,
    [userId]
  );
  if (active.rows.length > 0) redirect(`${LIST_PATH}?msg=active`);

  // Rule 3: history must stay intact. If other tables still reference this
  // user, PostgreSQL raises a foreign key error (23503) and we show a message.
  let outcome = "deleted";
  try {
    await withTransaction(async (client) => {
      await client.query("DELETE FROM sesi WHERE pengguna_id = $1", [userId]);
      await client.query("DELETE FROM users WHERE id = $1", [userId]);
    });
  } catch (error) {
    if (error.code === "23503") outcome = "has-history";
    else throw error;
  }

  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}?msg=${outcome}`);
}
