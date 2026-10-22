import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;
const SORT_OPTIONS = new Set(["newest", "price_asc", "price_desc", "name_asc"]);

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function parseNonNegativeInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoriesRaw = url.searchParams.get("category");
    const categories = categoriesRaw
      ? categoriesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const priceMin = parseNonNegativeInt(url.searchParams.get("priceMin"));
    const priceMax = parseNonNegativeInt(url.searchParams.get("priceMax"));
    const label = url.searchParams.get("label");
    const sortParam = url.searchParams.get("sort");
    const sort = sortParam && SORT_OPTIONS.has(sortParam) ? sortParam : "newest";
    const page = parsePositiveInt(url.searchParams.get("page"), 1);

    const where: Prisma.PremiumHoneyCollectionWhereInput = {};
    if (categories.length > 0) {
      where.category = { is: { slug: { in: categories } } };
    }
    if (priceMin !== null || priceMax !== null) {
      where.priceNumeric = {
        ...(priceMin !== null ? { gte: priceMin } : {}),
        ...(priceMax !== null ? { lte: priceMax } : {}),
      };
    }
    if (label) {
      where.label = { equals: label, mode: "insensitive" };
    }

    const orderBy: Prisma.PremiumHoneyCollectionOrderByWithRelationInput =
      sort === "price_asc"
        ? { priceNumeric: "asc" }
        : sort === "price_desc"
          ? { priceNumeric: "desc" }
          : sort === "name_asc"
            ? { name: "asc" }
            : { createdAt: "desc" };

    const [totalItems, items] = await Promise.all([
      prisma.premiumHoneyCollection.count({ where }),
      prisma.premiumHoneyCollection.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { category: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const safePage = page > totalPages ? 1 : page;

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page: safePage,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("[/api/products GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar produk" },
      { status: 500 },
    );
  }
}
