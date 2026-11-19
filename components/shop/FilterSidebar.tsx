"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProductFilters } from "@/hooks/useProductFilters";
import type { ICategory, LabelBadge } from "@/types/shop";

interface IFilterSidebarProps {
  categories: ICategory[];
  className?: string;
}

const LABEL_OPTIONS: { value: LabelBadge; label: string }[] = [
  { value: "bestseller", label: "Bestseller" },
  { value: "new", label: "Baru" },
  { value: "promo", label: "Promo" },
];

function FilterContents({ categories }: { categories: ICategory[] }) {
  const { filters, setCategories, setPriceRange, setLabel, reset } =
    useProductFilters();
  const [priceMin, setPriceMinLocal] = useState(filters.priceMin?.toString() ?? "");
  const [priceMax, setPriceMaxLocal] = useState(filters.priceMax?.toString() ?? "");

  const toggleCategory = (slug: string) => {
    if (filters.categories.includes(slug)) {
      setCategories(filters.categories.filter((s) => s !== slug));
    } else {
      setCategories([...filters.categories, slug]);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Kategori</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(c.slug)}
                  onChange={() => toggleCategory(c.slug)}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Harga (Rp)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMinLocal(e.target.value)}
            data-testid="price-min"
          />
          <span>—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMaxLocal(e.target.value)}
            data-testid="price-max"
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="mt-2 w-full"
          onClick={() =>
            setPriceRange(
              priceMin ? parseInt(priceMin, 10) : null,
              priceMax ? parseInt(priceMax, 10) : null,
            )
          }
        >
          Terapkan
        </Button>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Label</h3>
        <div className="flex flex-wrap gap-2">
          {LABEL_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={filters.label === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setLabel(filters.label === opt.value ? null : opt.value)
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </section>

      <Button variant="ghost" size="sm" onClick={reset}>
        Reset semua
      </Button>
    </div>
  );
}

export function FilterSidebar({ categories, className }: IFilterSidebarProps) {
  return (
    <>
      <aside className={`hidden lg:block ${className ?? ""}`}>
        <FilterContents categories={categories} />
      </aside>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            Filter
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Produk</SheetTitle>
          </SheetHeader>
          <FilterContents categories={categories} />
        </SheetContent>
      </Sheet>
    </>
  );
}
