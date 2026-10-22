"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { SortOption } from "@/types/shop";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Terbaru",
  price_asc: "Harga: Termurah",
  price_desc: "Harga: Termahal",
  name_asc: "Nama A–Z",
};

export function ShopHeader({
  title = "Belanja",
  totalItems,
}: {
  title?: string;
  totalItems?: number;
}) {
  const { filters, setSort } = useProductFilters();

  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {typeof totalItems === "number" ? (
          <p className="text-sm text-muted-foreground">
            {totalItems} produk tersedia
          </p>
        ) : null}
      </div>
      <div className="w-full sm:w-56">
        <Select
          value={filters.sort}
          onValueChange={(v) => setSort(v as SortOption)}
        >
          <SelectTrigger aria-label="Urutkan">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {SORT_LABELS[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
