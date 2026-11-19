/**
 * Kode error login credentials. Server melempar `CredentialsSignin` dengan `code` ini (lib/auth.ts);
 * client membaca `signIn(...).code` dan menampilkan pesan lewat `authErrorMessage`.
 * Aman diimpor dari Client Component (tanpa dependensi server).
 */
export const AUTH_ERROR_CODES = {
  invalidCredentials: "invalid_credentials",
  captchaFailed: "captcha_failed",
  captchaUnavailable: "captcha_unavailable",
  rateLimited: "rate_limited",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

const MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: "Email atau password salah",
  captcha_failed: "Verifikasi captcha gagal. Muat ulang halaman dan coba lagi.",
  captcha_unavailable: "Verifikasi keamanan sedang tidak tersedia. Silakan hubungi admin.",
  rate_limited: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.",
};

export function authErrorMessage(code: string | undefined): string {
  return MESSAGES[code as AuthErrorCode] ?? MESSAGES.invalid_credentials;
}
