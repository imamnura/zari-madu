import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin by session email
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
      select: { email: true, name: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching admin email:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
