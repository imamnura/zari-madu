import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const testimonialSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama harus diisi"),
  city: z.string().min(1, "Kota harus diisi"),
  text: z.string().min(1, "Testimoni harus diisi"),
  rating: z.number().min(1).max(5, "Rating harus antara 1-5"),
});

const testimonialContentSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  testimonials: z
    .array(testimonialSchema)
    .min(1, "Minimal harus ada 1 testimoni"),
});

// GET - Fetch testimonial content
export async function GET() {
  // Disable caching for this endpoint
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  try {
    let content = await prisma.testimonialContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!content) {
      // Return default content from constants
      return NextResponse.json(
        {
          heading: "Apa Kata Mereka?",
          title: "Ribuan pelanggan puas telah merasakan kualitas Zari Life",
          testimonials: [
            {
              id: 1,
              name: "Ibu Sari",
              city: "Jakarta",
              text: "Madu Zari benar-benar premium! Rasanya berbeda dari madu biasa. Anak-anak saya suka dan keluarga jadi lebih sehat.",
              rating: 5,
            },
            {
              id: 2,
              name: "Bapak Rizki",
              city: "Bandung",
              text: "Sudah jadi reseller Zari 2 tahun. Produknya mudah dijual karena kualitasnya terjamin dan packagingnya premium.",
              rating: 5,
            },
            {
              id: 3,
              name: "Ibu Dina",
              city: "Surabaya",
              text: "Cocok untuk hampers kantor. Klien-klien saya sangat puas dengan kualitas dan kemasannya yang elegan.",
              rating: 5,
            },
            {
              id: 4,
              name: "Bapak Ahmad",
              city: "Yogyakarta",
              text: "Madu hutan liarnya juara! Keasliannya terasa, cocok untuk jaga stamina dan kesehatan.",
              rating: 5,
            },
          ],
        },
        { headers }
      );
    }

    // Parse testimonials if it's a string
    const testimonials =
      typeof content.testimonials === "string"
        ? JSON.parse(content.testimonials)
        : content.testimonials;

    return NextResponse.json(
      {
        heading: content.heading,
        title: content.title,
        testimonials,
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching testimonial content:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// PUT - Update testimonial content
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validation = testimonialContentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { heading, title, testimonials } = validation.data;

    // Find existing content or create new
    let content = await prisma.testimonialContent.findFirst();

    if (content) {
      content = await prisma.testimonialContent.update({
        where: { id: content.id },
        data: {
          heading,
          title,
          testimonials,
          updatedAt: new Date(),
        },
      });
    } else {
      content = await prisma.testimonialContent.create({
        data: {
          heading,
          title,
          testimonials,
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
    console.error("Error updating testimonial content:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
