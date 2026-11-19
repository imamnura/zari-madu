import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Rate limit fixed-window yang disimpan di tabel `rate_limits` (berlaku lintas instance serverless).
 * Satu statement atomik per percobaan: INSERT ... ON CONFLICT menaikkan counter, atau me-reset-nya
 * bila window sudah lewat. Waktu memakai jam DB (UTC) agar konsisten antar instance.
 */
export interface IRateLimitRule {
  name: string;
  limit: number;
  windowSeconds: number;
}

const FIFTEEN_MINUTES = 15 * 60;

export const RATE_LIMITS = {
  // Login: lebar per IP, sempit per IP+email (bukan per email saja, agar penyerang tidak bisa
  // mengunci akun korban dari IP lain).
  adminLoginIp: { name: "login-admin:ip", limit: 20, windowSeconds: FIFTEEN_MINUTES },
  adminLoginAccount: { name: "login-admin:ip-email", limit: 5, windowSeconds: FIFTEEN_MINUTES },
  customerLoginIp: { name: "login-customer:ip", limit: 20, windowSeconds: FIFTEEN_MINUTES },
  customerLoginAccount: { name: "login-customer:ip-email", limit: 5, windowSeconds: FIFTEEN_MINUTES },
  register: { name: "register:ip", limit: 5, windowSeconds: 60 * 60 },
  // Lacak pesanan: cegah tebak nomor order + email.
  orderTrack: { name: "order-track:ip", limit: 20, windowSeconds: FIFTEEN_MINUTES },
  paymentRetry: { name: "payment-retry:ip", limit: 10, windowSeconds: FIFTEEN_MINUTES },
  // Checkout me-reserve stok: cegah penimbunan stok lewat order PENDING massal.
  checkout: { name: "checkout:ip", limit: 10, windowSeconds: FIFTEEN_MINUTES },
} satisfies Record<string, IRateLimitRule>;

export interface IRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function consumeRateLimit(
  rule: IRateLimitRule,
  identifier: string,
): Promise<IRateLimitResult> {
  const key = `${rule.name}:${identifier.toLowerCase()}`;
  // Jam DB dipotong ke milidetik = presisi kolom TIMESTAMP(3); tanpa ini pembulatan saat simpan
  // membuat resetAt - now sedikit > window dan Retry-After lebih 1 detik.
  try {
    const rows = await prisma.$queryRaw<Array<{ count: number; retryAfterSeconds: number }>>`
      INSERT INTO "rate_limits" ("key", "count", "resetAt")
      VALUES (
        ${key},
        1,
        date_trunc('milliseconds', now() AT TIME ZONE 'UTC')
          + (${rule.windowSeconds}::int * interval '1 second')
      )
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limits"."resetAt" <= date_trunc('milliseconds', now() AT TIME ZONE 'UTC') THEN 1
          ELSE "rate_limits"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "rate_limits"."resetAt" <= date_trunc('milliseconds', now() AT TIME ZONE 'UTC')
            THEN EXCLUDED."resetAt"
          ELSE "rate_limits"."resetAt"
        END
      RETURNING
        "count",
        GREATEST(
          0,
          CEIL(EXTRACT(EPOCH FROM ("resetAt" - date_trunc('milliseconds', now() AT TIME ZONE 'UTC'))))
        )::int AS "retryAfterSeconds"`;
    const row = rows[0];
    return {
      allowed: row.count <= rule.limit,
      remaining: Math.max(0, rule.limit - row.count),
      retryAfterSeconds: row.retryAfterSeconds,
    };
  } catch (error) {
    // Fail-open: gangguan tabel rate limit tidak boleh ikut mematikan login/checkout.
    console.error("[lib/rate-limit]", rule.name, error);
    return { allowed: true, remaining: rule.limit, retryAfterSeconds: 0 };
  }
}

/** Cek beberapa aturan sekaligus (mis. per IP dan per IP+email); semua counter tetap dinaikkan. */
export async function consumeRateLimits(
  checks: Array<[IRateLimitRule, string]>,
): Promise<IRateLimitResult> {
  const results = await Promise.all(checks.map(([rule, id]) => consumeRateLimit(rule, id)));
  const blocked = results.filter((r) => !r.allowed);
  if (blocked.length === 0) {
    return {
      allowed: true,
      remaining: Math.min(...results.map((r) => r.remaining)),
      retryAfterSeconds: 0,
    };
  }
  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.max(...blocked.map((r) => r.retryAfterSeconds)),
  };
}

/** IP klien dari header proxy (Vercel/nginx mengisi x-forwarded-for; entri pertama = klien). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`;
}

export function tooManyRequestsResponse(result: IRateLimitResult): NextResponse {
  return NextResponse.json(
    { success: false, error: rateLimitMessage(result.retryAfterSeconds) },
    { status: 429, headers: { "Retry-After": String(Math.max(1, result.retryAfterSeconds)) } },
  );
}

/** Hapus counter yang window-nya sudah lewat; dipanggil dari cron. */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const { count } = await prisma.rateLimit.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });
  return count;
}
