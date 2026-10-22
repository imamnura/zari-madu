import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderNumber?: string; email?: string };
    if (!body.orderNumber) {
      return NextResponse.json(
        { success: false, error: "orderNumber wajib" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: body.orderNumber },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Hanya order berstatus PENDING yang bisa diretry" },
        { status: 409 },
      );
    }

    // Authorize: either matching session, or matching guest email
    const session = await auth();
    const customerId =
      session?.user?.role === "customer" ? session.user.id : null;
    const ownsByCustomer = customerId && order.customerId === customerId;
    const ownsByGuestEmail =
      body.email && order.guestEmail?.toLowerCase() === body.email.toLowerCase();
    if (!ownsByCustomer && !ownsByGuestEmail) {
      return NextResponse.json(
        { success: false, error: "Tidak diizinkan" },
        { status: 403 },
      );
    }

    let recipientEmail = order.guestEmail ?? "";
    let recipientPhone = order.guestPhone ?? "";
    if (order.customerId) {
      const c = await prisma.customer.findUnique({
        where: { id: order.customerId },
      });
      recipientEmail = c?.email ?? recipientEmail;
      recipientPhone = c?.phone ?? recipientPhone;
    }

    const snap = await createSnapTransaction({
      orderId: order.orderNumber,
      grossAmount: order.total,
      customer: {
        firstName: order.recipientName,
        email: recipientEmail,
        phone: recipientPhone,
      },
      items: order.items.map((it) => ({
        id: it.productId ?? it.id,
        name: it.productName,
        price: it.unitPrice,
        quantity: it.quantity,
      })),
      shipping: { fee: order.shippingFee },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "midtrans",
        snapToken: snap.token,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber, snapToken: snap.token },
    });
  } catch (error) {
    console.error("[/api/payment/midtrans/retry POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memulai pembayaran ulang" },
      { status: 500 },
    );
  }
}
