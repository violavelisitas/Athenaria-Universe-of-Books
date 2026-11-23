"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";

const LIST_PATH = "/kelola/buku";
const DEFAULT_COVER = "https://placehold.co/300x450?text=No+Cover";
const ALLOWED_ROLES = ["admin", "pegawai"];

function readInteger(raw) {
  return raw === "" ? NaN : Number(raw);
}

function readBookForm(formData) {
  const text = (field) => String(formData.get(field) ?? "").trim();

  const values = {
    title: text("title"),
    isbn: text("isbn"),
    author: text("author"),
    publisher: text("publisher"),
    year: text("year"),
    categoryId: text("categoryId"),
    stock: text("stock"),
    maxLoanDays: text("maxLoanDays"),
    finePerDay: text("finePerDay"),
    coverUrl: text("coverUrl"),
    synopsis: text("synopsis"),
  };

  const errors = {};
  const currentYear = new Date().getFullYear();

  const isbn = values.isbn.replace(/[-\s]/g, "");
  const year = readInteger(values.year);
  const categoryId = parseId(values.categoryId);
  const stock = readInteger(values.stock);
  const maxLoanDays = readInteger(values.maxLoanDays);
  const finePerDay = readInteger(values.finePerDay);

  if (values.title.length < 2 || values.title.length > 200) {
    errors.title = "Judul 2 sampai 200 karakter.";
  }
  if (!/^\d{10}(\d{3})?$/.test(isbn)) {
    errors.isbn = "ISBN harus 10 atau 13 digit angka.";
  }
  if (values.author.length < 2) errors.author = "Pengarang minimal 2 karakter.";
  if (values.publisher.length < 2) errors.publisher = "Penerbit minimal 2 karakter.";
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
    errors.year = `Tahun terbit 1000 sampai ${currentYear}.`;
  }
  if (!categoryId) errors.categoryId = "Pilih kategori";
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) {
    errors.stock = "Stok harus bilangan bulat 0 atau lebih.";
  }
  if (!Number.isInteger(maxLoanDays) || maxLoanDays < 1 || maxLoanDays > 90) {
    errors.maxLoanDays = "Durasi pinjam 1 sampai 90 hari.";
  }
  if (!Number.isInteger(finePerDay) || finePerDay < 0 || finePerDay > 1000000) {
    errors.finePerDay = "Tarif denda harus bilangan bulat 0 atau lebih";
  }

  let coverUrl = DEFAULT_COVER;
  if (values.coverUrl !== "") {
    try {
      const parsed = new URL(values.coverUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      coverUrl = values.coverUrl;
    } catch {
      errors.coverUrl = "Tautan sampul harus berupa URL http atau https";
    }
  }

  if (values.synopsis.length > 2000) {
    errors.synopsis = "Sinopsis maksimal 2000 karakter";
  }

  const data = {
    title: values.title,
    isbn,
    author: values.author,
    publisher: values.publisher,
    year,
    categoryId,
    stock,
    maxLoanDays,
    finePerDay,
    coverUrl,
    synopsis: values.synopsis,
  };

  return { values, errors, data };
}


async function findDatabaseErrors(data, excludeId = null) {
  const errors = {};

  const duplicate = await pool.query(
    "SELECT 1 FROM buku WHERE isbn = $1 AND ($2::int IS NULL OR id <> $2)",
    [data.isbn, excludeId]
  );
  if (duplicate.rows.length > 0) errors.isbn = "ISBN sudah terdaftar.";

  const category = await pool.query("SELECT 1 FROM kategori WHERE id = $1", [
    data.categoryId,
  ]);
  if (category.rows.length === 0) errors.categoryId = "Kategori tidak ditemukan.";

  return errors;
}

export async function createBookAction(previousState, formData) {
  await requireRole(...ALLOWED_ROLES);

  const { values, errors, data } = readBookForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  const dbErrors = await findDatabaseErrors(data);
  if (Object.keys(dbErrors).length > 0) return { errors: dbErrors, values };

  await pool.query(
    `INSERT INTO buku
       (judul, isbn, pengarang, penerbit, tahun_terbit, kategori_id,
        jumlah_stok, durasi_maks_pinjam, tarif_denda_per_hari,
        link_sampul, sinopsis)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      data.title, data.isbn, data.author, data.publisher, data.year,
      data.categoryId, data.stock, data.maxLoanDays, data.finePerDay,
      data.coverUrl, data.synopsis,
    ]
  );

  revalidatePath(LIST_PATH);
  revalidatePath("/katalog");
  redirect(LIST_PATH);
}


export async function updateBookAction(id, previousState, formData) {
  await requireRole(...ALLOWED_ROLES);

  const bookId = parseId(id);
  if (!bookId) redirect(LIST_PATH);

  const { values, errors, data } = readBookForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  const dbErrors = await findDatabaseErrors(data, bookId);
  if (Object.keys(dbErrors).length > 0) return { errors: dbErrors, values };

  await pool.query(
    `UPDATE buku
     SET judul = $1, isbn = $2, pengarang = $3, penerbit = $4,
         tahun_terbit = $5, kategori_id = $6, jumlah_stok = $7,
         durasi_maks_pinjam = $8, tarif_denda_per_hari = $9,
         link_sampul = $10, sinopsis = $11
     WHERE id = $12`,
    [
      data.title, data.isbn, data.author, data.publisher, data.year,
      data.categoryId, data.stock, data.maxLoanDays, data.finePerDay,
      data.coverUrl, data.synopsis, bookId,
    ]
  );

  revalidatePath(LIST_PATH);
  revalidatePath("/katalog");
  revalidatePath(`/katalog/${bookId}`);
  redirect(LIST_PATH);
}

export async function deleteBookAction(id) {
  await requireRole(...ALLOWED_ROLES);

  const bookId = parseId(id);
  if (!bookId) redirect(LIST_PATH);

  const loans = await pool.query(
    `SELECT
       COUNT(*) FILTER (
         WHERE status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
       ) AS active_count,
       COUNT(*) AS total_count
     FROM transaksi
     WHERE buku_id = $1`,
    [bookId]
  );

  if (Number(loans.rows[0].active_count) > 0) {
    redirect(`${LIST_PATH}?error=active`);
  }
  if (Number(loans.rows[0].total_count) > 0) {
    redirect(`${LIST_PATH}?error=history`);
  }

  let blockedByRelation = false;
  try {
    await pool.query("DELETE FROM buku WHERE id = $1", [bookId]);
  } catch (error) {
    // 23503 = kode error postgresql untuk pelanggaran fk
    if (error.code === "23503") blockedByRelation = true;
    else throw error;
  }
  if (blockedByRelation) redirect(`${LIST_PATH}?error=history`);

  revalidatePath(LIST_PATH);
  revalidatePath("/katalog");
  redirect(LIST_PATH);
}