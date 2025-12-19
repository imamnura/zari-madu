import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const criterionSchema = z.object({
  icon: z.string().min(1, "Icon harus diisi"),
  title: z.string().min(1, "Judul kriteria harus diisi"),
  description: z.string().min(1, "Deskripsi kriteria harus diisi"),
});

const whyChooseSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  criteria: z.array(criterionSchema).min(1, "Minimal harus ada 1 kriteria"),
});

// GET - Fetch why choose content
export async function GET() {
  // Disable caching for this endpoint
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  try {
    const content = await prisma.whyChooseContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!content) {
      // Return default content from constants
      return NextResponse.json({
        heading: "Mengapa Memilih Zari Honey?",
        title: "Komitmen kami pada kualitas dan kepuasan Anda",
        criteria: [
          {
            icon: "ShieldCheck",
            title: "Jaminan Kemurnian",
            description:
              "100% madu murni tanpa campuran gula atau bahan lain. Tersertifikasi lab independen.",
          },
          {
            icon: "Sparkles",
            title: "Premium Quality",
            description:
              "Dipilih dari sumber terbaik dengan standar kualitas tertinggi untuk pengalaman premium.",
          },
          {
            icon: "Leaf",
            title: "Natural & Organic",
            description:
              "Diproses minimal untuk mempertahankan enzim, vitamin, dan mineral alami.",
          },
          {
            icon: "MapPin",
            title: "Single-Origin",
            description:
              "Setiap varian berasal dari satu sumber nektar untuk rasa dan aroma yang khas.",
          },
          {
            icon: "Users",
            title: "Mendukung Peternak Lokal",
            description:
              "Bermitra langsung dengan peternak lebah lokal untuk keberlanjutan ekonomi.",
          },
          {
            icon: "Award",
            title: "Trusted Brand",
            description:
              "Dipercaya lebih dari 1 juta pelanggan di seluruh Indonesia.",
          },
        ],
      });
    }

    // Parse criteria if it's a string
    const criteria =
      typeof content.criteria === "string"
        ? JSON.parse(content.criteria)
        : content.criteria;

    return NextResponse.json(
      {
        heading: content.heading,
        title: content.title,
        criteria,
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching why choose content:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// PUT - Update why choose content
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validation = whyChooseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { heading, title, criteria } = validation.data;

    // Find existing content or create new
    let content = await prisma.whyChooseContent.findFirst();

    if (content) {
      content = await prisma.whyChooseContent.update({
        where: { id: content.id },
        data: {
          heading,
          title,
          criteria,
          updatedAt: new Date(),
        },
      });
    } else {
      content = await prisma.whyChooseContent.create({
        data: {
          heading,
          title,
          criteria,
        },
      });
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/");

    return NextResponse.json({
      message: "Data berhasil disimpan",
      data: content,
    });
  } catch (error) {
    console.error("Error updating why choose content:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
