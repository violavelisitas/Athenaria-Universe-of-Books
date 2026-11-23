"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_STATUSES,
} from "@/lib/announcements";

const LIST_PATH = "/kelola/pengumuman";
const ALLOWED_ROLES = ["admin", "pegawai"];

function readAnnouncementForm(formData) {
  const text = (field) => String(formData.get(field) ?? "").trim();

  const values = {
    title: text("title"),
    content: text("content"),
    category: text("category"),
    publishDate: text("publishDate"),
    status: text("status"),
  };

  const errors = {};
  if (values.title.length < 3 || values.title.length > 150) {
    errors.title = "Judul 3 sampai 150 karakter.";
  }
  if (values.content.length < 10 || values.content.length > 5000) {
    errors.content = "Isi pengumuman 10 sampai 5000 karakter.";
  }
  if (!Object.hasOwn(ANNOUNCEMENT_CATEGORIES, values.category)) {
    errors.category = "Pilih kategori.";
  }
  // The date must look like YYYY-MM-DD and be a real calendar date.
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.publishDate) ||
    Number.isNaN(new Date(values.publishDate).getTime())
  ) {
    errors.publishDate = "Tanggal rilis tidak valid.";
  }
  if (!ANNOUNCEMENT_STATUSES.includes(values.status)) {
    errors.status = "Pilih status.";
  }

  return { values, errors };
}

export async function createAnnouncementAction(previousState, formData) {
  const user = await requireRole(...ALLOWED_ROLES);

  const { values, errors } = readAnnouncementForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  await pool.query(
    `INSERT INTO pengumuman
       (judul, isi, kategori, tanggal_publikasi, status, dibuat_oleh)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [values.title, values.content, values.category, values.publishDate, values.status, user.id]
  );

  revalidatePath(LIST_PATH);
  revalidatePath("/");
  revalidatePath("/pengumuman");
  redirect(`${LIST_PATH}?msg=created`);
}

// Bound with .bind(null, announcementId) in the edit page.
export async function updateAnnouncementAction(id, previousState, formData) {
  await requireRole(...ALLOWED_ROLES);

  const announcementId = parseId(id);
  if (!announcementId) redirect(LIST_PATH);

  const { values, errors } = readAnnouncementForm(formData);
  if (Object.keys(errors).length > 0) return { errors, values };

  await pool.query(
    `UPDATE pengumuman
     SET judul = $1, isi = $2, kategori = $3, tanggal_publikasi = $4, status = $5
     WHERE id = $6`,
    [values.title, values.content, values.category, values.publishDate, values.status, announcementId]
  );

  revalidatePath(LIST_PATH);
  revalidatePath("/");
  revalidatePath("/pengumuman");
  revalidatePath(`/pengumuman/${announcementId}`);
  redirect(`${LIST_PATH}?msg=updated`);
}

export async function deleteAnnouncementAction(id) {
  await requireRole(...ALLOWED_ROLES);

  const announcementId = parseId(id);
  if (!announcementId) redirect(LIST_PATH);

  await pool.query("DELETE FROM pengumuman WHERE id = $1", [announcementId]);

  revalidatePath(LIST_PATH);
  revalidatePath("/");
  revalidatePath("/pengumuman");
  redirect(`${LIST_PATH}?msg=deleted`);
}

// Switches between Draft and Published. Drafts are never shown publicly.
export async function togglePublishAction(id) {
  await requireRole(...ALLOWED_ROLES);

  const announcementId = parseId(id);
  if (!announcementId) redirect(LIST_PATH);

  await pool.query(
    `UPDATE pengumuman
     SET status = CASE WHEN status = 'Published' THEN 'Draft' ELSE 'Published' END
     WHERE id = $1`,
    [announcementId]
  );

  revalidatePath(LIST_PATH);
  revalidatePath("/");
  revalidatePath("/pengumuman");
  revalidatePath(`/pengumuman/${announcementId}`);
  redirect(`${LIST_PATH}?msg=toggled`);
}
