import type { NextConfig } from "next";
import { getServerEnv } from "./lib/env";
import { buildSecurityHeaders } from "./lib/security-headers";

const env = getServerEnv();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          isDev: env.NODE_ENV !== "production",
          reportOnly: env.CSP_REPORT_ONLY,
        }),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
