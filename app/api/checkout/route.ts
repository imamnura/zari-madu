import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  guestCheckoutSchema,
  customerCheckoutSchema,
} from "@/lib/schemas/shop";
import { readGuestSessionToken, resolveCart } from "@/lib/cart";
import { resolveShippingFee } from "@/lib/shipping";
import {
  createOrderAndReserveStock,
  OutOfStockError,
  restoreOrderStock,
} from "@/lib/orders";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isCustomer = session?.user?.role === "customer";
    const body = await request.json();

    const guestParsed = isCustomer ? null : guestCheckoutSchema.safeParse(body);
    const customerParsed = isCustomer
      ? customerCheckoutSchema.safeParse(body)
      : null;

    if (guestParsed && !guestParsed.success) {
      return NextResponse.json(
        { success: false, error: guestParsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }
    if (customerParsed && !customerParsed.success) {
      return NextResponse.json(
        { success: false, error: customerParsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const customerId = isCustomer ? session!.user.id : null;
    const sessionToken = isCustomer ? null : await readGuestSessionToken();
    const cart = await resolveCart({ customerId, sessionToken });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Keranjang kosong" },
        { status: 400 },
      );
    }

    interface IAddressSnapshot {
      recipientName: string;
      addressLine: string;
      rtRw: string | null;
      kelurahan: string;
      kecamatan: string;
      city: string;
      province: string;
      postalCode: string;
      notes: string | null;
    }
    interface IContactSnapshot {
      customerId: string | null;
      guestEmail: string | null;
      guestPhone: string | null;
    }
    let address: IAddressSnapshot;
    let contact: IContactSnapshot;
    let recipientEmail: string;

    if (guestParsed && guestParsed.success) {
      address = {
        recipientName: guestParsed.data.recipientName,
        addressLine: guestParsed.data.addressLine,
        rtRw: guestParsed.data.rtRw ?? null,
        kelurahan: guestParsed.data.kelurahan,
        kecamatan: guestParsed.data.kecamatan,
        city: guestParsed.data.city,
        province: guestParsed.data.province,
        postalCode: guestParsed.data.postalCode,
        notes: guestParsed.data.notes ?? null,
      };
      contact = {
        customerId: null,
        guestEmail: guestParsed.data.email,
        guestPhone: guestParsed.data.phone,
      };
      recipientEmail = guestParsed.data.email;
    } else if (customerParsed && customerParsed.success) {
      const data = customerParsed.data;
      let resolved: IAddressSnapshot | null = null;
      if (data.addressId) {
        const saved = await prisma.address.findUnique({
          where: { id: data.addressId },
        });
        if (!saved || saved.customerId !== customerId) {
          return NextResponse.json(
            { success: false, error: "Alamat tidak ditemukan" },
            { status: 404 },
          );
        }
        resolved = {
          recipientName: saved.recipientName,
          addressLine: saved.addressLine,
          rtRw: saved.rtRw,
          kelurahan: saved.kelurahan,
          kecamatan: saved.kecamatan,
          city: saved.city,
          province: saved.province,
          postalCode: saved.postalCode,
          notes: data.notes ?? null,
        };
      } else if (data.newAddress) {
        resolved = {
          recipientName: data.newAddress.recipientName,
          addressLine: data.newAddress.addressLine,
          rtRw: data.newAddress.rtRw ?? null,
          kelurahan: data.newAddress.kelurahan,
          kecamatan: data.newAddress.kecamatan,
          city: data.newAddress.city,
          province: data.newAddress.province,
          postalCode: data.newAddress.postalCode,
          notes: data.notes ?? data.newAddress.notes ?? null,
        };
        if (data.saveNewAddress) {
          await prisma.address.create({
            data: {
              customerId: customerId!,
              recipientName: data.newAddress.recipientName,
              phone: data.newAddress.phone,
              addressLine: data.newAddress.addressLine,
              rtRw: data.newAddress.rtRw ?? null,
              kelurahan: data.newAddress.kelurahan,
              kecamatan: data.newAddress.kecamatan,
              city: data.newAddress.city,
              province: data.newAddress.province,
              postalCode: data.newAddress.postalCode,
            },
          });
        }
      }
      if (!resolved) {
        return NextResponse.json(
          { success: false, error: "Alamat tidak lengkap" },
          { status: 400 },
        );
      }
      address = resolved;

      const customerRow = await prisma.customer.findUnique({
        where: { id: customerId! },
      });
      contact = {
        customerId,
        guestEmail: null,
        guestPhone: null,
      };
      recipientEmail = customerRow?.email ?? "";
    } else {
      return NextResponse.json(
        { success: false, error: "Sertakan data tamu atau data pelanggan" },
        { status: 400 },
      );
    }

    const shipping = await resolveShippingFee(address.province);
    if (!shipping) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pengiriman ke provinsi ini belum tersedia. Hubungi admin via WhatsApp.",
        },
        { status: 400 },
      );
    }

    let orderId: string;
    let orderNumber: string;
    try {
      const created = await createOrderAndReserveStock({
        cart,
        address,
        contact,
        shippingFee: shipping.fee,
      });
      orderId = created.orderId;
      orderNumber = created.orderNumber;
    } catch (err) {
      if (err instanceof OutOfStockError) {
        return NextResponse.json(
          {
            success: false,
            error: "Beberapa produk kehabisan stok",
            data: { items: err.items },
          },
          { status: 409 },
        );
      }
      throw err;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order tidak ditemukan setelah dibuat" },
        { status: 500 },
      );
    }

    try {
      const snap = await createSnapTransaction({
        orderId: orderNumber,
        grossAmount: order.total,
        customer: {
          firstName: order.recipientName,
          email: recipientEmail,
          phone:
            order.guestPhone ??
            (await prisma.customer.findUnique({ where: { id: customerId! } }))?.phone ??
            "",
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
          orderId,
          provider: "midtrans",
          snapToken: snap.token,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        data: { orderId, orderNumber, snapToken: snap.token },
      });
    } catch (err) {
      console.error("[/api/checkout] Midtrans init failed", err);
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: "payment_init_failed",
        },
      });
      await restoreOrderStock(orderId);
      return NextResponse.json(
        { success: false, error: "Gagal memulai pembayaran. Coba lagi." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[/api/checkout POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses checkout" },
      { status: 500 },
    );
  }
}
