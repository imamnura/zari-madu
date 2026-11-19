import { getServerEnv, isProductionRuntime } from "@/lib/env";

/**
 * Cloudflare Turnstile — verifikasi server-side.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export function isTurnstileConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
  const secret = getServerEnv().TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    // Gangguan jaringan ke Cloudflare = tidak terverifikasi (fail-closed), bukan error 500.
    console.error("[lib/turnstile verify]", error);
    return false;
  }
}

export type TurnstileCheck =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "missing" | "invalid"; error: string };

/**
 * Aturan captcha untuk login admin, login customer, dan registrasi customer:
 * - terkonfigurasi → token wajib dan harus valid;
 * - tidak terkonfigurasi di production → ditolak (fail-closed);
 * - tidak terkonfigurasi di development/test → dilewati.
 */
export async function checkTurnstile(
  token: string | undefined,
  remoteip?: string,
): Promise<TurnstileCheck> {
  if (!isTurnstileConfigured()) {
    if (isProductionRuntime()) {
      console.error(
        "[lib/turnstile] TURNSTILE_SECRET_KEY / NEXT_PUBLIC_TURNSTILE_SITE_KEY belum diset di production; permintaan ditolak",
      );
      return {
        ok: false,
        reason: "unavailable",
        error: "Verifikasi keamanan sedang tidak tersedia. Silakan hubungi admin.",
      };
    }
    return { ok: true };
  }

  if (!token?.trim()) {
    return {
      ok: false,
      reason: "missing",
      error: "Selesaikan verifikasi captcha terlebih dahulu",
    };
  }
  const valid = await verifyTurnstileToken(token, remoteip);
  return valid
    ? { ok: true }
    : {
        ok: false,
        reason: "invalid",
        error: "Verifikasi captcha gagal. Muat ulang halaman dan coba lagi.",
      };
}
