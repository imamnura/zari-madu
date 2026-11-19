import { NextRequest, NextResponse } from "next/server";
import { listProducts, parseProductQuery } from "@/lib/data/products";

export async function GET(request: NextRequest) {
  try {
    const query = parseProductQuery(new URL(request.url).searchParams);
    const data = await listProducts(query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/products GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar produk" },
      { status: 500 },
    );
  }
}
