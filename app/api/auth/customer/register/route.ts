import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerCustomerSchema } from "@/lib/schemas/shop";
import { checkTurnstile } from "@/lib/turnstile";
import { consumeRateLimit, getClientIp, RATE_LIMITS, tooManyRequestsResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = await consumeRateLimit(RATE_LIMITS.register, getClientIp(request.headers));
    if (!limit.allowed) return tooManyRequestsResponse(limit);

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

    const captcha = await checkTurnstile(parsed.data.turnstileToken);
    if (!captcha.ok) {
      return NextResponse.json(
        { success: false, error: captcha.error },
        { status: 400 },
      );
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
