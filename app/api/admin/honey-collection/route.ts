import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Retrieve all premium honey collections
export async function GET(request: NextRequest) {
  try {
    const collections = await prisma.premiumHoneyCollection.findMany({
      where: {
        honeyCollectionContentId: {
          not: null,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    console.error("Error fetching honey collections:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data koleksi madu",
      },
      { status: 500 }
    );
  }
}

// POST - Create new premium honey collection
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, image, label, features } = body;

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama dan deskripsi harus diisi",
        },
        { status: 400 }
      );
    }

    const collection = await prisma.premiumHoneyCollection.create({
      data: {
        name,
        description,
        price: price || null,
        image: image || null,
        label: label || null,
        features: features || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: collection,
      message: "Koleksi madu berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error creating honey collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menambahkan koleksi madu",
      },
      { status: 500 }
    );
  }
}

// PUT - Update premium honey collection
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, price, image, label, features } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID harus disertakan",
        },
        { status: 400 }
      );
    }

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama dan deskripsi harus diisi",
        },
        { status: 400 }
      );
    }

    const collection = await prisma.premiumHoneyCollection.update({
      where: { id },
      data: {
        name,
        description,
        price: price || null,
        image: image || null,
        label: label || null,
        features: features || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: collection,
      message: "Koleksi madu berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating honey collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengupdate koleksi madu",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete premium honey collection
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID harus disertakan",
        },
        { status: 400 }
      );
    }

    await prisma.premiumHoneyCollection.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Koleksi madu berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting honey collection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus koleksi madu",
      },
      { status: 500 }
    );
  }
}
