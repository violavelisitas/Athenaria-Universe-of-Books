"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";

const LIST_PATH = "/admin/kategori";

function readCategoryForm(formData) {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    description: String(formData.get("description") ?? "").trim(),
  };

  const errors = {};
  if (values.name.length < 3) {
    errors.name = "Nama kategori minimal 3 karakter.";
  }
  if (!/^[A-Z0-9]{2,10}$/.test(values.code)) {
    errors.code = "Kode klasifikasi 2 sampai 10 karakter (huruf atau angka).";
  }
  if (values.description.length > 500) {
    errors.description = "Deskripsi maksimal 500 karakter.";
  }
  return { values, errors };
}

async function findDuplicateErrors(values, excludeId = null) {
  const result = await pool.query(
    `SELECT nama, kode_klasifikasi
     FROM kategori
     WHERE (LOWER(nama) = LOWER($1) OR kode_klasifikasi = $2)
       AND ($3::int IS NULL OR id <> $3)`,
    [values.name, values.code, excludeId]
  );

  const errors = {};
  for (const row of result.rows) {
    if (row.nama.toLowerCase() === values.name.toLowerCase()) {
      errors.name = "Nama kategori sudah dipakai";
    }
    if (row.kode_klasifikasi === values.code) {
      errors.code = "Kode klasifikasi sudah dipakai";
    }
  }
  return errors;
}

export async function createCategoryAction(previousState, formData) {
  await requireRole("admin");

  const { values, errors } = readCategoryForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  const duplicateErrors = await findDuplicateErrors(values);
  if (Object.keys(duplicateErrors).length > 0) {
    return { errors: duplicateErrors, values };
  }

  await pool.query(
    "INSERT INTO kategori (nama, kode_klasifikasi, deskripsi) VALUES ($1, $2, $3)",
    [values.name, values.code, values.description || null]
  );

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateCategoryAction(id, previousState, formData) {
  await requireRole("admin");

  const categoryId = parseId(id);
  if (!categoryId) redirect(LIST_PATH);

  const { values, errors } = readCategoryForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  const duplicateErrors = await findDuplicateErrors(values, categoryId);
  if (Object.keys(duplicateErrors).length > 0) {
    return { errors: duplicateErrors, values };
  }

  await pool.query(
    `UPDATE kategori
     SET nama = $1, kode_klasifikasi = $2, deskripsi = $3
     WHERE id = $4`,
    [values.name, values.code, values.description || null, categoryId]
  );

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteCategoryAction(id) {
  await requireRole("admin");

  const categoryId = parseId(id);
  if (!categoryId) redirect(LIST_PATH);

  // A category that still has books cannot be deleted
  const usage = await pool.query(
    "SELECT COUNT(*) AS total FROM buku WHERE kategori_id = $1",
    [categoryId]
  );
  if (Number(usage.rows[0].total) > 0) {
    redirect(`${LIST_PATH}?error=in-use`);
  }

  await pool.query("DELETE FROM kategori WHERE id = $1", [categoryId]);

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}