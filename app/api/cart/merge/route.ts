import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mergeGuestCartIntoCustomer } from "@/lib/cart";
import { mergeGuestCartSchema } from "@/lib/schemas/shop";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "customer") {
      return NextResponse.json(
        { success: false, error: "Login terlebih dahulu" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = mergeGuestCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const result = await mergeGuestCartIntoCustomer({
      guestItems: parsed.data.items,
      customerId: session.user.id,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[/api/cart/merge POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menggabungkan keranjang" },
      { status: 500 },
    );
  }
}
