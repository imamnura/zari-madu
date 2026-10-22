import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminOrderTransitionSchema } from "@/lib/schemas/shop";
import { restoreOrderStock } from "@/lib/orders";
import { sendOrderShippedEmail } from "@/lib/email";
import type { OrderStatus } from "@prisma/client";

const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") return false;
  return true;
}

export async function GET(
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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: "desc" } },
        customer: { select: { id: true, email: true, name: true, phone: true } },
      },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[/api/admin/orders/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesanan" },
      { status: 500 },
    );
  }
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
    const parsed = adminOrderTransitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 },
      );
    }

    const legal = LEGAL_TRANSITIONS[order.status];
    if (!legal.includes(parsed.data.targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Transisi ${order.status} → ${parsed.data.targetStatus} tidak diizinkan`,
        },
        { status: 409 },
      );
    }

    const target = parsed.data.targetStatus;
    const now = new Date();
    const updateData: Record<string, unknown> = { status: target };
    if (target === "SHIPPED") {
      updateData.shippedAt = now;
      updateData.trackingNumber = parsed.data.trackingNumber!;
      updateData.courier = parsed.data.courier!;
    }
    if (target === "DELIVERED") {
      updateData.deliveredAt = now;
    }
    if (target === "CANCELLED") {
      updateData.cancelledAt = now;
      updateData.cancelReason = parsed.data.cancelReason ?? "admin_cancel";
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    if (target === "CANCELLED" && order.status !== "SHIPPED" && order.status !== "DELIVERED") {
      await restoreOrderStock(id);
    }

    if (target === "SHIPPED") {
      const recipient = updated.guestEmail ??
        (updated.customerId
          ? (await prisma.customer.findUnique({ where: { id: updated.customerId } }))?.email
          : null);
      if (recipient) {
        await sendOrderShippedEmail(
          {
            id: updated.id,
            orderNumber: updated.orderNumber,
            status: updated.status,
            subtotal: updated.subtotal,
            shippingFee: updated.shippingFee,
            total: updated.total,
            paidAt: updated.paidAt?.toISOString() ?? null,
            shippedAt: updated.shippedAt?.toISOString() ?? null,
            deliveredAt: updated.deliveredAt?.toISOString() ?? null,
            cancelledAt: updated.cancelledAt?.toISOString() ?? null,
            trackingNumber: updated.trackingNumber,
            courier: updated.courier,
            recipientName: updated.recipientName,
            addressLine: updated.addressLine,
            rtRw: updated.rtRw,
            kelurahan: updated.kelurahan,
            kecamatan: updated.kecamatan,
            city: updated.city,
            province: updated.province,
            postalCode: updated.postalCode,
            notes: updated.notes,
            guestEmail: updated.guestEmail,
            guestPhone: updated.guestPhone,
            items: updated.items.map((it) => ({
              id: it.id,
              productId: it.productId,
              productName: it.productName,
              productImage: it.productImage,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              subtotal: it.subtotal,
            })),
            createdAt: updated.createdAt.toISOString(),
          },
          recipient,
        );
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[/api/admin/orders/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui pesanan" },
      { status: 500 },
    );
  }
}
