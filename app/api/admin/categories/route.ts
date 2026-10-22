import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/schemas/shop";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("[/api/admin/categories GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Slug sudah digunakan" },
        { status: 409 },
      );
    }

    const created = await prisma.category.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        image: parsed.data.image ?? null,
        displayOrder: parsed.data.displayOrder,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("[/api/admin/categories POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat kategori" },
      { status: 500 },
    );
  }
}
