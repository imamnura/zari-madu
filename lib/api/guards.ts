import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

/**
 * Session hanya jika user login sebagai admin. Customer bisa mendaftar sendiri,
 * jadi cek `session` saja tidak cukup untuk endpoint `/api/admin/*`.
 */
export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}
