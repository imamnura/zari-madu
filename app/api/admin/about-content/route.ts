import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const aboutContentSchema = z.object({
  tagline: z.string().min(5, "Tagline minimal 5 karakter"),
  heading: z.string().min(1, "Title about harus diisi"),
  body: z.string().min(1, "Description about harus diisi"),
  stats: z
    .array(
      z.object({
        value: z.string().min(1, "Value harus diisi"),
        label: z.string().min(1, "Label harus diisi"),
      })
    )
    .min(1, "Minimal 1 stat diperlukan"),
});

// GET - Ambil about content
export async function GET() {
  try {
    let aboutContent = await prisma.aboutContent.findFirst({
      where: { id: "default" },
    });

    if (!aboutContent) {
      // Create default if not exists
      aboutContent = await prisma.aboutContent.create({
        data: {
          id: "default",
          tagline: "Terpercaya & Berkualitas",
          heading: "Tentang Zari Honey",
          body: "Zari Honey hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia yang premium, murni, dan berkualitas tinggi. Kami bekerja langsung dengan peternak lokal terpilih untuk memastikan setiap produk memenuhi standar kualitas tertinggi.",
          stats: JSON.stringify([
            { value: "1M+", label: "Pelanggan Puas" },
            { value: "100%", label: "Madu Murni" },
            { value: "50+", label: "Sumber Panen" },
            { value: "10+", label: "Tahun Pengalaman" },
          ]),
        },
      });
    }

    // Parse JSON fields
    const parseStats = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    const response = {
      ...aboutContent,
      stats: parseStats(aboutContent.stats),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT - Update about content (requires authentication)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = aboutContentSchema.parse(body);

    const aboutContent = await prisma.aboutContent.upsert({
      where: { id: "default" },
      update: {
        tagline: validated.tagline,
        heading: validated.heading,
        body: validated.body,
        stats: JSON.stringify(validated.stats),
      },
      create: {
        id: "default",
        tagline: validated.tagline,
        heading: validated.heading,
        body: validated.body,
        stats: JSON.stringify(validated.stats),
      },
    });

    const parseStatsForResponse = (data: any) => {
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    };

    return NextResponse.json({
      success: true,
      data: {
        ...aboutContent,
        stats: parseStatsForResponse(aboutContent.stats),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating about content:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
