/**
 * Security headers untuk semua route (dipasang lewat `headers()` di next.config.ts).
 *
 * CSP memakai 'unsafe-inline' untuk script: nonce memaksa semua halaman dirender dinamis
 * dan mematikan ISR (homepage, artikel). Perlindungan utama tetap ada lewat allowlist
 * origin script/frame, `frame-ancestors 'none'`, `object-src 'none'`, dan `base-uri 'self'`.
 *
 * Origin pihak ketiga yang diizinkan:
 * - Midtrans Snap (script + popup iframe)       *.midtrans.com
 * - Cloudflare Turnstile (script + iframe)      challenges.cloudflare.com
 * - Google Analytics                            googletagmanager.com, *.google-analytics.com
 * - Embed Google Maps di footer                 www.google.com, maps.google.com
 * Gambar boleh dari https mana pun (URL gambar artikel/produk diisi admin).
 */
export interface ISecurityHeaderOptions {
  isDev: boolean;
  /** Kirim CSP sebagai Content-Security-Policy-Report-Only (tidak memblokir, hanya melapor di console). */
  reportOnly?: boolean;
}

const MIDTRANS = "https://*.midtrans.com";
const TURNSTILE = "https://challenges.cloudflare.com";
const GTM = "https://www.googletagmanager.com";
const GA = "https://*.google-analytics.com https://*.analytics.google.com";
const GOOGLE_MAPS = "https://www.google.com https://maps.google.com";

export function buildContentSecurityPolicy({ isDev }: ISecurityHeaderOptions): string {
  const directives: Record<string, string> = {
    "default-src": "'self'",
    // 'unsafe-eval' hanya untuk React Refresh / Turbopack di development.
    "script-src": `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${MIDTRANS} ${TURNSTILE} ${GTM}`,
    "style-src": `'self' 'unsafe-inline' ${MIDTRANS}`,
    "img-src": "'self' data: blob: https:",
    "font-src": "'self' data:",
    "connect-src": `'self'${isDev ? " ws: wss:" : ""} ${MIDTRANS} ${TURNSTILE} ${GTM} ${GA}`,
    "frame-src": `${MIDTRANS} ${TURNSTILE} ${GOOGLE_MAPS}`,
    "worker-src": "'self' blob:",
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self'",
    "frame-ancestors": "'none'",
  };
  const policy = Object.entries(directives).map(([name, value]) => `${name} ${value}`);
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function buildSecurityHeaders(
  options: ISecurityHeaderOptions,
): Array<{ key: string; value: string }> {
  const headers = [
    {
      key: options.reportOnly
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    // Fallback untuk browser lama yang belum mengenal frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
  ];
  if (!options.isDev) {
    // Hanya di production (HTTPS); tanpa `preload` karena sulit dibatalkan.
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }
  return headers;
}
