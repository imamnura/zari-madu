import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ShopResults, ShopResultsSkeleton } from "@/components/shop/ShopResults";
import { parseProductQuery, toSearchParams } from "@/lib/data/products";

export const metadata = {
  title: "Belanja Madu Premium — Zari Honey",
  description: "Jelajahi koleksi madu premium Zari Honey: madu hutan liar, multiflora, klanceng dan lainnya.",
};

interface IShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Dinamis karena filter ada di URL; listing dirender di server (tanpa fetch client) dan
// tidak di-cache karena menampilkan stok terkini.
export default async function ShopPage({ searchParams }: IShopPageProps) {
  const query = parseProductQuery(toSearchParams(await searchParams));
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={null}>
        <div className="space-y-6">
          <ShopHeader />
          <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
            <FilterSidebar categories={categories} />
            <Suspense key={JSON.stringify(query)} fallback={<ShopResultsSkeleton />}>
              <ShopResults query={query} />
            </Suspense>
          </div>
        </div>
      </Suspense>
    </main>
  );
}
