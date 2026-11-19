import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/schemas/shop";

async function requireAdmin() {
  const session = await auth();
  return Boolean(session && session.user?.role === "admin");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = categoryInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    if (parsed.data.slug) {
      const conflict = await prisma.category.findFirst({
        where: { slug: parsed.data.slug, NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "Slug sudah digunakan" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[/api/admin/categories/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await context.params;
    const productsUsingCategory = await prisma.premiumHoneyCollection.count({
      where: { categoryId: id },
    });
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori masih dipakai oleh ${productsUsingCategory} produk. Pindahkan produk dulu.`,
        },
        { status: 409 },
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/admin/categories/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 },
    );
  }
}
