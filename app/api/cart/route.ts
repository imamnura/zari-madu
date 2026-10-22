import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrCreateGuestSessionToken,
  resolveCart,
} from "@/lib/cart";

export async function GET() {
  try {
    const session = await auth();
    const customerId =
      session?.user?.role === "customer" ? session.user.id : null;

    let sessionToken: string | null = null;
    if (!customerId) {
      sessionToken = await getOrCreateGuestSessionToken();
    }

    const cart = await resolveCart({
      customerId,
      sessionToken,
      createIfMissing: true,
    });

    return NextResponse.json({
      success: true,
      data: cart ?? { id: null, items: [], subtotal: 0, itemCount: 0 },
    });
  } catch (error) {
    console.error("[/api/cart GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat keranjang" },
      { status: 500 },
    );
  }
}
