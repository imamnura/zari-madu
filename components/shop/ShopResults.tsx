import {
  listProducts,
  type IProductListResult,
  type IProductQuery,
} from "@/lib/data/products";
import { ProductGrid } from "./ProductGrid";

/** Listing produk dirender di server; dibungkus `<Suspense key>` di halaman agar skeleton tampil saat filter berubah. */
export async function ShopResults({ query }: { query: IProductQuery }) {
  let result: IProductListResult;
  try {
    result = await listProducts(query);
  } catch (error) {
    console.error("[/shop ShopResults]", error);
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          Gagal memuat produk. Silakan muat ulang halaman.
        </p>
      </div>
    );
  }
  return <ProductGrid items={result.items} pagination={result.pagination} />;
}

export function ShopResultsSkeleton() {
  return (
    <div
      data-testid="shop-loading"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
