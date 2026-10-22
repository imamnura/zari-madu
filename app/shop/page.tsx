import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Belanja Madu Premium — Zari Honey",
  description: "Jelajahi koleksi madu premium Zari Honey: madu hutan liar, multiflora, klanceng dan lainnya.",
};

export default async function ShopPage() {
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
            <ShopBrowser />
          </div>
        </div>
      </Suspense>
    </main>
  );
}
