import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isTurnstileConfigured,
  verifyTurnstileToken,
} from "@/lib/turnstile";
import type { Role } from "@/types/shop";

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
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        if (isTurnstileConfigured()) {
          const token = credentials.turnstileToken as string | undefined;
          if (!token?.trim()) {
            throw new Error("Selesaikan verifikasi captcha terlebih dahulu");
          }
          const ok = await verifyTurnstileToken(token);
          if (!ok) {
            throw new Error("Verifikasi captcha gagal. Muat ulang halaman dan coba lagi.");
          }
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });
        if (!admin) {
          throw new Error("Email atau password salah");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          admin.password,
        );
        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
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
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email as string },
        });
        if (!customer || !customer.passwordHash) {
          throw new Error("Email atau password salah");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          customer.passwordHash,
        );
        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer" as Role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
