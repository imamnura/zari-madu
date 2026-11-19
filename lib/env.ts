import { z } from "zod";

/**
 * Satu pintu baca environment variable sisi server. Nilai kosong / spasi dianggap tidak diset.
 * Dibaca ulang dari `process.env` tiap pemanggilan (murah, dan test bisa mengubah env).
 *
 * Variabel `NEXT_PUBLIC_*` yang dipakai di Client Component tetap dibaca langsung lewat
 * `process.env.NEXT_PUBLIC_X` agar di-inline oleh Next.js saat build.
 */
const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.string().optional(),
);

const flag = optionalString.transform((value) => value?.toLowerCase() === "true");

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PHASE: optionalString,

  DATABASE_URL: optionalString,
  AUTH_SECRET: optionalString,
  NEXTAUTH_SECRET: optionalString,
  CRON_SECRET: optionalString,

  TURNSTILE_SECRET_KEY: optionalString,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,

  MIDTRANS_SERVER_KEY: optionalString,
  MIDTRANS_IS_PRODUCTION: flag,

  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  WHATSAPP_ADMIN_PHONE: optionalString,

  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`[lib/env] Environment variable tidak valid — ${detail}`);
  }
  return parsed.data;
}

export function isProductionRuntime(env: ServerEnv = getServerEnv()): boolean {
  return env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build";
}

/**
 * `fatal`: tanpa ini aplikasi tidak bisa jalan sama sekali.
 * `warnings`: fitur terkait akan gagal / fail-closed (captcha, pembayaran, email, upload, cron).
 */
export function findMissingProductionEnv(env: ServerEnv): { fatal: string[]; warnings: string[] } {
  const fatal: string[] = [];
  if (!env.DATABASE_URL) fatal.push("DATABASE_URL");
  if (!env.AUTH_SECRET && !env.NEXTAUTH_SECRET) fatal.push("AUTH_SECRET");

  const warnings: string[] = [];
  const featureVars: Array<keyof ServerEnv> = [
    "TURNSTILE_SECRET_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "CRON_SECRET",
    "MIDTRANS_SERVER_KEY",
    "RESEND_API_KEY",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  for (const key of featureVars) {
    if (!env[key]) warnings.push(key);
  }
  return { fatal, warnings };
}

/** Dipanggil dari `instrumentation.ts` saat server production start. */
export function assertProductionEnv(env: ServerEnv = getServerEnv()): void {
  if (!isProductionRuntime(env)) return;
  const { fatal, warnings } = findMissingProductionEnv(env);
  if (warnings.length > 0) {
    console.error(
      `[lib/env] Env production belum diset, fitur terkait akan ditolak/gagal: ${warnings.join(", ")}`,
    );
  }
  if (fatal.length > 0) {
    throw new Error(`[lib/env] Env wajib production belum diset: ${fatal.join(", ")}`);
  }
}
