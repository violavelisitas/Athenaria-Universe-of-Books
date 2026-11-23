import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import crypto from "crypto";
import pool from "@/lib/db";

const SESSION_COOKIE_NAME = "session";
const SESSION_LIFETIME_DAYS = 7;

// The raw token lives only in the user's cookie. The database stores
// its SHA-256 hash, so a leaked database cannot be used to hijack sessions.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Called after a successful login or registration.
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");

  // The expiry is computed inside PostgreSQL, so it always uses the
  // same clock and time zone as the NOW() used when checking it.
  await pool.query(
    `INSERT INTO sesi (pengguna_id, token_hash, kadaluarsa)
     VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 day'))`,
    [userId, hashToken(token), SESSION_LIFETIME_DAYS]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_LIFETIME_DAYS * 24 * 60 * 60,
  });
}

// Returns { id, name, email, role } or null when nobody is logged in.
// cache() makes this query run once per request, even when it is
// called from both the layout and the page.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const result = await pool.query(
    `SELECT u.id, u.nama AS name, u.email, u.role
     FROM sesi s
     JOIN users u ON u.id = s.pengguna_id
     WHERE s.token_hash = $1 AND s.kadaluarsa > NOW()`,
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await pool.query("DELETE FROM sesi WHERE token_hash = $1", [
      hashToken(token),
    ]);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Requires a logged-in user; otherwise redirects to /login.
export async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Requires a logged-in user whose role is allowed.
// Example: await requireRole("admin", "pegawai");
export async function requireRole(...allowedRoles) {
  const user = await requireLogin();
  if (!allowedRoles.includes(user.role)) redirect("/");
  return user;
}