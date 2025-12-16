import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const partnershipSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama partner harus diisi"),
  logo: z.string().min(1, "Logo harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
});

const partnershipContentSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  partnerships: z
    .array(partnershipSchema)
    .min(1, "Minimal harus ada 1 partner"),
});

// GET - Fetch partnership content
export async function GET() {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  try {
    let content = await prisma.partnershipContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!content) {
      return NextResponse.json(
        {
          heading: "Partner & Sertifikasi",
          title:
            "Dipercaya dan bersertifikat resmi dari berbagai lembaga terkemuka",
          partnerships: [
            {
              id: 1,
              name: "Asosiasi Perlebahan Indonesia",
              logo: "/images/partners/api.png",
              description:
                "Partner resmi dalam pengembangan industri perlebahan",
            },
            {
              id: 2,
              name: "BPOM RI",
              logo: "/images/partners/bpom.png",
              description: "Tersertifikasi dan terdaftar resmi",
            },
            {
              id: 3,
              name: "Halal MUI",
              logo: "/images/partners/mui.png",
              description: "Bersertifikat Halal MUI",
            },
            {
              id: 4,
              name: "SGS Lab",
              logo: "/images/partners/sgs.png",
              description: "Teruji laboratorium internasional",
            },
            {
              id: 5,
              name: "Organic Indonesia",
              logo: "/images/partners/organic.png",
              description: "Certified organic products",
            },
            {
              id: 6,
              name: "Koperasi Peternak Lebah",
              logo: "/images/partners/koperasi.png",
              description: "Mendukung peternak lokal",
            },
          ],
        },
        { headers }
      );
    }

    const partnerships =
      typeof content.partnerships === "string"
        ? JSON.parse(content.partnerships)
        : content.partnerships;

    return NextResponse.json(
      {
        heading: content.heading,
        title: content.title,
        partnerships,
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching partnership content:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// PUT - Update partnership content
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validation = partnershipContentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { heading, title, partnerships } = validation.data;

    let content = await prisma.partnershipContent.findFirst();

    if (content) {
      content = await prisma.partnershipContent.update({
        where: { id: content.id },
        data: {
          heading,
          title,
          partnerships,
          updatedAt: new Date(),
        },
      });
    } else {
      content = await prisma.partnershipContent.create({
        data: {
          heading,
          title,
          partnerships,
        },
      });
    }

    revalidatePath("/");

    return NextResponse.json({
      message: "Data berhasil disimpan",
      data: content,
    });
  } catch (error) {
    console.error("Error updating partnership content:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
