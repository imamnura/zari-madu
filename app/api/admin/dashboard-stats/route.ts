import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get article count
    const articleContentResult = await prisma.articleContent.findFirst({
      select: { articles: true },
    });

    const articleCount = articleContentResult
      ? (articleContentResult.articles as any[]).length
      : 0;

    // Get honey collection count
    const honeyCollectionCount = await prisma.premiumHoneyCollection.count();

    // Get testimonial count
    const testimonialContentResult = await prisma.testimonialContent.findFirst({
      select: { testimonials: true },
    });

    const testimonialCount = testimonialContentResult
      ? (testimonialContentResult.testimonials as any[]).length
      : 0;

    // Get partnership count
    const partnershipContentResult = await prisma.partnershipContent.findFirst({
      select: { partnerships: true },
    });

    const partnershipCount = partnershipContentResult
      ? (partnershipContentResult.partnerships as any[]).length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        articleCount,
        honeyCollectionCount,
        testimonialCount,
        partnershipCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
