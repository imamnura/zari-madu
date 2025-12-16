import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const heroContentSchema = z.object({
  badges: z.array(z.string()).min(1, "Minimal 1 badge diperlukan"),
  typewriterTexts: z
    .array(z.string())
    .min(1, "Minimal 1 teks typewriter diperlukan"),
  description: z.string().optional(),
  productImage: z.string().nullable().optional(),
});

// GET - Ambil hero content
export async function GET() {
  try {
    let heroContent = await prisma.heroContent.findFirst({
      where: { id: "default" },
    });

    if (!heroContent) {
      // Create default if not exists
      heroContent = await prisma.heroContent.create({
        data: {
          id: "default",
          badges: JSON.stringify([
            "100% Raw Honey",
            "Single-Origin",
            "Lab Tested",
            "Premium Quality",
          ]),
          typewriterTexts: JSON.stringify([
            "Madu Premium Asli dari Alam Indonesia",
            "Kualitas Terpercaya - Tanpa Aditif",
          ]),
          description:
            "Nikmati kemurnian alam dalam setiap tetes. 100% murni, tanpa campuran, langsung dari sumbernya.",
          productImage: null,
        },
      });
    }

    // Parse JSON fields - handle both string and object
    const parseBadges = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    const parseTypewriterTexts = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    const response = {
      ...heroContent,
      badges: parseBadges(heroContent.badges),
      typewriterTexts: parseTypewriterTexts(heroContent.typewriterTexts),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT - Update hero content (requires authentication)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = heroContentSchema.parse(body);

    const heroContent = await prisma.heroContent.upsert({
      where: { id: "default" },
      update: {
        badges: JSON.stringify(validated.badges),
        typewriterTexts: JSON.stringify(validated.typewriterTexts),
        description: validated.description || "",
        productImage: validated.productImage,
      },
      create: {
        id: "default",
        badges: JSON.stringify(validated.badges),
        typewriterTexts: JSON.stringify(validated.typewriterTexts),
        description: validated.description || "",
        productImage: validated.productImage,
      },
    });

    const parseBadgesForResponse = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    const parseTypewriterTextsForResponse = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    return NextResponse.json({
      success: true,
      data: {
        ...heroContent,
        badges: parseBadgesForResponse(heroContent.badges),
        typewriterTexts: parseTypewriterTextsForResponse(
          heroContent.typewriterTexts
        ),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating hero content:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
