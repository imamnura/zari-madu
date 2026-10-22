import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerCustomerSchema } from "@/lib/schemas/shop";
import {
  isTurnstileConfigured,
  verifyTurnstileToken,
} from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Input tidak valid",
        },
        { status: 400 },
      );
    }

    if (isTurnstileConfigured()) {
      const ok = await verifyTurnstileToken(parsed.data.turnstileToken);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "Verifikasi captcha gagal" },
          { status: 400 },
        );
      }
    }

    const existing = await prisma.customer.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const customer = await prisma.customer.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        provider: "CREDENTIALS",
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(
      { success: true, data: customer, message: "Pendaftaran berhasil" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[/api/auth/customer/register POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mendaftarkan akun" },
      { status: 500 },
    );
  }
}
