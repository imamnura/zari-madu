import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  mapTransactionStatusToOrder,
  mapTransactionStatusToPayment,
  verifyNotificationSignature,
} from "@/lib/midtrans";
import { restoreOrderStock } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { IMidtransNotification, IOrderView } from "@/types/shop";

function toOrderView(
  order: Awaited<ReturnType<typeof prisma.order.findUnique>> & {
    items: Awaited<ReturnType<typeof prisma.orderItem.findMany>>;
  },
): IOrderView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    paidAt: order.paidAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    trackingNumber: order.trackingNumber,
    courier: order.courier,
    recipientName: order.recipientName,
    addressLine: order.addressLine,
    rtRw: order.rtRw,
    kelurahan: order.kelurahan,
    kecamatan: order.kecamatan,
    city: order.city,
    province: order.province,
    postalCode: order.postalCode,
    notes: order.notes,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    items: order.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImage: it.productImage,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IMidtransNotification;

    if (!verifyNotificationSignature(body)) {
      console.warn("[midtrans-webhook] Invalid signature", body.order_id);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: body.order_id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    const targetOrderStatus = mapTransactionStatusToOrder(
      body.transaction_status,
      body.fraud_status,
    );
    const targetPaymentStatus = mapTransactionStatusToPayment(
      body.transaction_status,
    );

    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: body.transaction_id, status: targetPaymentStatus },
    });
    if (existingPayment) {
      return NextResponse.json({ success: true, data: { idempotent: true } });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "midtrans",
        transactionId: body.transaction_id,
        paymentMethod: body.payment_type,
        status: targetPaymentStatus,
        rawResponse: body as unknown as object,
        paidAt: targetPaymentStatus === "SETTLEMENT" ? new Date() : null,
      },
    });

    if (targetOrderStatus === "PAID" && order.status === "PENDING") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
        include: { items: true },
      });
      const recipient = updated.guestEmail ??
        (updated.customerId
          ? (await prisma.customer.findUnique({ where: { id: updated.customerId } }))?.email
          : null);
      if (recipient) {
        await sendOrderConfirmationEmail(toOrderView(updated), recipient);
      }
    } else if (targetOrderStatus === "CANCELLED" && order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: `midtrans_${body.transaction_status}`,
        },
      });
      await restoreOrderStock(order.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/payment/midtrans/notification POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses notifikasi" },
      { status: 500 },
    );
  }
}
