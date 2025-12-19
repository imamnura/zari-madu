import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Retrieve honey collection content (title & description)
export async function GET(request: NextRequest) {
  try {
    let content = await prisma.honeyCollectionContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // If no content exists, create default
    if (!content) {
      content = await prisma.honeyCollectionContent.create({
        data: {
          title: "Koleksi Madu Premium",
          description:
            "Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching honey collection content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data content",
      },
      { status: 500 }
    );
  }
}

// PUT - Update honey collection content
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
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Title dan description harus diisi",
        },
        { status: 400 }
      );
    }

    // Find existing content or get the first one
    const existingContent = await prisma.honeyCollectionContent.findFirst();

    let content;
    if (existingContent) {
      content = await prisma.honeyCollectionContent.update({
        where: { id: existingContent.id },
        data: {
          title,
          description,
        },
      });
    } else {
      content = await prisma.honeyCollectionContent.create({
        data: {
          title,
          description,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: content,
      message: "Content berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating honey collection content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengupdate content",
      },
      { status: 500 }
    );
  }
}
