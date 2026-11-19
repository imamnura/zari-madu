"use client";

import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { IProduct, IPagination } from "@/types/shop";

interface IProductGridProps {
  items: IProduct[];
  pagination: IPagination;
}

export function ProductGrid({ items, pagination }: IProductGridProps) {
  const { setPage } = useProductFilters();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          Tidak ada produk yang cocok dengan filter Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        data-testid="product-grid"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      ) : null}
    </div>
  );
}
