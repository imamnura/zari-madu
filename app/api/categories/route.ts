import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[/api/categories GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil kategori" },
      { status: 500 },
    );
  }
}
