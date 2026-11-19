import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressInputSchema } from "@/lib/schemas/shop";

async function requireCustomer() {
  const session = await auth();
  if (!session || session.user?.role !== "customer") return null;
  return session.user.id;
}

export async function GET() {
  try {
    const customerId = await requireCustomer();
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Login terlebih dahulu" },
        { status: 401 },
      );
    }

    const addresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("[/api/account/addresses GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat alamat" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerId = await requireCustomer();
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Login terlebih dahulu" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = addressInputSchema.extend({}).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const makeDefault = body?.isDefault === true;
    if (makeDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    const created = await prisma.address.create({
      data: {
        customerId,
        recipientName: parsed.data.recipientName,
        phone: parsed.data.phone,
        addressLine: parsed.data.addressLine,
        rtRw: parsed.data.rtRw ?? null,
        kelurahan: parsed.data.kelurahan,
        kecamatan: parsed.data.kecamatan,
        city: parsed.data.city,
        province: parsed.data.province,
        postalCode: parsed.data.postalCode,
        isDefault: makeDefault,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("[/api/account/addresses POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan alamat" },
      { status: 500 },
    );
  }
}
