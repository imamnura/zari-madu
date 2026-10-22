import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const product = await prisma.premiumHoneyCollection.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[/api/products/[slug] GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil produk" },
      { status: 500 },
    );
  }
}
