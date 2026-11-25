
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseId } from "@/lib/helpers";

export const dynamic = "force-dynamic";

const SORTS = {
  title: "b.judul ASC",
  year: "b.tahun_terbit DESC, b.judul ASC",
  rating: "avg_rating DESC, review_count DESC, b.judul ASC",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const keyword = searchParams.get("q")?.trim() || null;
  const categoryId = parseId(searchParams.get("category"));
  const sortKey = searchParams.get("sort");
  const orderBy = Object.hasOwn(SORTS, sortKey) ? SORTS[sortKey] : SORTS.title;
  const limit = Math.min(Math.max(parseId(searchParams.get("limit")) ?? 50, 1), 100);

  try {
    const result = await pool.query(
      `SELECT b.id, b.judul, b.pengarang, b.penerbit, b.tahun_terbit,
              b.jumlah_stok, b.link_sampul, k.nama AS kategori,
              COALESCE(ROUND(AVG(u.rating)::numeric, 1), 0) AS avg_rating,
              COUNT(u.id) AS review_count
       FROM buku b
       JOIN kategori k ON k.id = b.kategori_id
       LEFT JOIN ulasan u ON u.buku_id = b.id
       WHERE ($1::text IS NULL
              OR b.judul ILIKE '%' || $1 || '%'
              OR b.pengarang ILIKE '%' || $1 || '%')
         AND ($2::int IS NULL OR b.kategori_id = $2)
       GROUP BY b.id, k.nama
       ORDER BY ${orderBy}
       LIMIT $3`,
      [keyword, categoryId, limit]
    );

    const data = result.rows.map((row) => ({
      ...row,
      avg_rating: Number(row.avg_rating),
      review_count: Number(row.review_count),
    }));

    return NextResponse.json({ total: data.length, data });
  } catch (error) {
    console.error("GET /api/buku failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
