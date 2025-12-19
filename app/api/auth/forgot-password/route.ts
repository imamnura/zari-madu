import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Request password reset (verify email and send reset token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email harus diisi",
        },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset password telah dikirim",
      });
    }

    // In production, you would:
    // 1. Generate a secure reset token
    // 2. Store it in database with expiry
    // 3. Send email with reset link

    // For now, we'll return a simple success message
    // Since this is a demo without email service
    return NextResponse.json({
      success: true,
      message: "Silakan hubungi administrator untuk reset password",
      // In production, remove this hint
      hint: "Demo mode: Contact admin to reset password",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}

// PUT - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email dan password baru harus diisi",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Email tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil direset",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mereset password",
      },
      { status: 500 }
    );
  }
}
