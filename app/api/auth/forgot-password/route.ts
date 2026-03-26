import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postBodySchema = z.object({
  email: z.string().email("Format email tidak valid").max(320),
});

// POST - Request password reset (tanpa membocorkan apakah email terdaftar)
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = postBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Data tidak valid",
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset password telah dikirim",
      });
    }

    // Produksi: token + email; saat ini hanya pesan generik (tanpa email service)
    return NextResponse.json({
      success: true,
      message: "Silakan hubungi administrator untuk reset password",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    );
  }
}
