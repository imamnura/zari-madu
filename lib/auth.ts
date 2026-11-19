import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkTurnstile } from "@/lib/turnstile";
import { getServerEnv } from "@/lib/env";
import { AUTH_ERROR_CODES, type AuthErrorCode } from "@/lib/auth-errors";
import { consumeRateLimits, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { Role } from "@/types/shop";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = getServerEnv();

/** Error login yang `code`-nya sampai ke client (`signIn(...).code`), lihat lib/auth-errors.ts. */
class LoginError extends CredentialsSignin {
  constructor(code: AuthErrorCode) {
    super();
    this.code = code;
  }
}

/**
 * Pemeriksaan sebelum mencocokkan password: rate limit (per IP dan per IP+email) lalu captcha.
 * Rate limit dihitung lebih dulu agar percobaan dengan captcha salah pun ikut terhitung.
 */
async function guardCredentialsLogin(
  kind: "admin" | "customer",
  credentials: Partial<Record<string, unknown>>,
  request: Request,
): Promise<{ email: string; password: string }> {
  const email = typeof credentials.email === "string" ? credentials.email.trim() : "";
  const password = typeof credentials.password === "string" ? credentials.password : "";
  if (!email || !password) {
    throw new LoginError(AUTH_ERROR_CODES.invalidCredentials);
  }

  const ip = getClientIp(request.headers);
  const [ipRule, accountRule] =
    kind === "admin"
      ? [RATE_LIMITS.adminLoginIp, RATE_LIMITS.adminLoginAccount]
      : [RATE_LIMITS.customerLoginIp, RATE_LIMITS.customerLoginAccount];
  const limit = await consumeRateLimits([
    [ipRule, ip],
    [accountRule, `${ip}:${email}`],
  ]);
  if (!limit.allowed) {
    throw new LoginError(AUTH_ERROR_CODES.rateLimited);
  }

  const captcha = await checkTurnstile(
    typeof credentials.turnstileToken === "string" ? credentials.turnstileToken : undefined,
  );
  if (!captcha.ok) {
    throw new LoginError(
      captcha.reason === "unavailable"
        ? AUTH_ERROR_CODES.captchaUnavailable
        : AUTH_ERROR_CODES.captchaFailed,
    );
  }

  return { email, password };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile", type: "text" },
      },
      authorize: async (credentials, request) => {
        const { email, password } = await guardCredentialsLogin(
          "admin",
          credentials ?? {},
          request,
        );

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
          throw new LoginError(AUTH_ERROR_CODES.invalidCredentials);
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
          throw new LoginError(AUTH_ERROR_CODES.invalidCredentials);
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin" as Role,
        };
      },
    }),
    Credentials({
      id: "customer-credentials",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile", type: "text" },
      },
      authorize: async (credentials, request) => {
        const { email, password } = await guardCredentialsLogin(
          "customer",
          credentials ?? {},
          request,
        );

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer || !customer.passwordHash) {
          throw new LoginError(AUTH_ERROR_CODES.invalidCredentials);
        }

        const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
        if (!isPasswordValid) {
          throw new LoginError(AUTH_ERROR_CODES.invalidCredentials);
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer" as Role,
        };
      },
    }),
    ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const email = profile?.email;
        if (!email) return false;

        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
          user.id = existing.id;
          user.role = "customer";
          return true;
        }

        const created = await prisma.customer.create({
          data: {
            email,
            name: profile?.name ?? email.split("@")[0],
            provider: "GOOGLE",
            emailVerified: new Date(),
          },
        });
        user.id = created.id;
        user.role = "customer";
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.role = (user.role as Role | undefined) ?? token.role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role | undefined) ?? "customer";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
