import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const articleSchema = z.object({
  id: z.number(),
  slug: z.string().min(1),
  title: z.string().min(5),
  excerpt: z.string().min(10),
  image: z.string().min(1), // Can be URL or base64
  category: z.string().min(1),
  author: z.string().min(1),
  date: z.string().min(1),
  readTime: z.string().min(1),
  content: z.string().min(10),
  tags: z.array(z.string()),
});

const articleContentSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title tidak boleh kosong"),
  description: z.string().min(1, "Description tidak boleh kosong"),
  articles: z.array(articleSchema).min(1, "Minimal 1 artikel"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await prisma.articleContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!content) {
      // Return default values from constants
      return NextResponse.json(
        {
          heading: "Artikel & Tips",
          title: "Edukasi Sehat dengan Madu",
          description:
            "Pelajari lebih dalam tentang dunia madu, kesehatan, dan gaya hidup sehat melalui artikel-artikel pilihan kami.",
          articles: [],
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Parse JSON fields
    const articles =
      typeof content.articles === "string"
        ? JSON.parse(content.articles)
        : content.articles;

    return NextResponse.json(
      {
        id: content.id,
        heading: content.heading,
        title: content.title,
        description: content.description,
        articles,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching articles content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = articleContentSchema.parse(body);

    // Check if record exists
    const existingContent = await prisma.articleContent.findFirst();

    let content;
    if (existingContent) {
      // Update existing record
      content = await prisma.articleContent.update({
        where: { id: existingContent.id },
        data: {
          heading: validatedData.heading,
          title: validatedData.title,
          description: validatedData.description,
          articles: JSON.stringify(validatedData.articles),
        },
      });
    } else {
      // Create new record
      content = await prisma.articleContent.create({
        data: {
          heading: validatedData.heading,
          title: validatedData.title,
          description: validatedData.description,
          articles: JSON.stringify(validatedData.articles),
        },
      });
    }

    // Parse articles back
    const articles =
      typeof content.articles === "string"
        ? JSON.parse(content.articles)
        : content.articles;

    // Revalidate homepage
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/articles");

    return NextResponse.json(
      {
        id: content.id,
        heading: content.heading,
        title: content.title,
        description: content.description,
        articles,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating articles content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
