import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { IPagination, IProduct, SortOption } from "@/types/shop";

/**
 * Query listing produk, dipakai bersama oleh halaman `/shop` (render server) dan
 * `GET /api/products`. Tidak di-cache: listing menampilkan stok yang berubah tiap checkout.
 */
export const PRODUCT_PAGE_SIZE = 12;

const SORT_OPTIONS: readonly SortOption[] = ["newest", "price_asc", "price_desc", "name_asc"];

export interface IProductQuery {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  label: string | null;
  sort: SortOption;
  page: number;
}

export interface IProductListResult {
  items: IProduct[];
  pagination: IPagination;
}

type ProductWithCategory = Prisma.PremiumHoneyCollectionGetPayload<{
  include: { category: true };
}>;

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

/** `searchParams` halaman (record) → URLSearchParams; nilai array diambil yang pertama. */
export function toSearchParams(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}

export function parseProductQuery(params: URLSearchParams): IProductQuery {
  const categoriesRaw = params.get("category");
  const sortParam = params.get("sort");
  return {
    categories: categoriesRaw
      ? categoriesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    priceMin: parseNonNegativeInt(params.get("priceMin")),
    priceMax: parseNonNegativeInt(params.get("priceMax")),
    label: params.get("label"),
    sort: (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
      ? (sortParam as SortOption)
      : "newest",
    page: parsePositiveInt(params.get("page"), 1),
  };
}

export function toProductView(row: ProductWithCategory): IProduct {
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    label: row.label,
    price: row.price,
    priceNumeric: row.priceNumeric,
    stock: row.stock,
    alwaysAvailable: row.alwaysAvailable,
    weightGrams: row.weightGrams,
    features: row.features,
    category: row.category
      ? {
          id: row.category.id,
          slug: row.category.slug,
          name: row.category.name,
          description: row.category.description,
          image: row.category.image,
          displayOrder: row.category.displayOrder,
          isActive: row.category.isActive,
        }
      : null,
  };
}

export async function listProducts(query: IProductQuery): Promise<IProductListResult> {
  const where: Prisma.PremiumHoneyCollectionWhereInput = {};
  if (query.categories.length > 0) {
    where.category = { is: { slug: { in: query.categories } } };
  }
  if (query.priceMin !== null || query.priceMax !== null) {
    where.priceNumeric = {
      ...(query.priceMin !== null ? { gte: query.priceMin } : {}),
      ...(query.priceMax !== null ? { lte: query.priceMax } : {}),
    };
  }
  if (query.label) {
    where.label = { equals: query.label, mode: "insensitive" };
  }

  const orderBy: Prisma.PremiumHoneyCollectionOrderByWithRelationInput =
    query.sort === "price_asc"
      ? { priceNumeric: "asc" }
      : query.sort === "price_desc"
        ? { priceNumeric: "desc" }
        : query.sort === "name_asc"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const findPage = (page: number) =>
    prisma.premiumHoneyCollection.findMany({
      where,
      orderBy,
      skip: (page - 1) * PRODUCT_PAGE_SIZE,
      take: PRODUCT_PAGE_SIZE,
      include: { category: true },
    });

  // Count & halaman diminta jalan paralel; bila `page` ternyata melewati halaman terakhir
  // (URL lama, produk dihapus), ambil ulang halaman terakhir agar metadata cocok dengan items.
  const [totalItems, requestedRows] = await Promise.all([
    prisma.premiumHoneyCollection.count({ where }),
    findPage(query.page),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCT_PAGE_SIZE));
  const safePage = Math.min(query.page, totalPages);
  const rows =
    safePage !== query.page && totalItems > 0 ? await findPage(safePage) : requestedRows;

  return {
    items: rows.map(toProductView),
    pagination: { page: safePage, pageSize: PRODUCT_PAGE_SIZE, totalItems, totalPages },
  };
}
