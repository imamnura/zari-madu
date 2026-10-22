"use client";

import { useEffect, useState } from "react";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ProductGrid } from "./ProductGrid";
import type { IProduct, IPagination } from "@/types/shop";

interface IBrowserState {
  loading: boolean;
  items: IProduct[];
  pagination: IPagination;
}

const EMPTY_PAGINATION: IPagination = {
  page: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 1,
};

function buildQueryFromFilters(
  filters: ReturnType<typeof useProductFilters>["filters"],
): string {
  const params = new URLSearchParams();
  if (filters.categories.length > 0) params.set("category", filters.categories.join(","));
  if (filters.priceMin !== null) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== null) params.set("priceMax", String(filters.priceMax));
  if (filters.label) params.set("label", filters.label);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function ShopBrowser() {
  const { filters } = useProductFilters();
  const [state, setState] = useState<IBrowserState>({
    loading: true,
    items: [],
    pagination: EMPTY_PAGINATION,
  });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: show loading skeleton while re-fetching on filter change
    setState((s) => ({ ...s, loading: true }));
    const qs = buildQueryFromFilters(filters);
    fetch(`/api/products${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setState({
            loading: false,
            items: json.data.items,
            pagination: json.data.pagination,
          });
        } else {
          setState({ loading: false, items: [], pagination: EMPTY_PAGINATION });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, items: [], pagination: EMPTY_PAGINATION });
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  if (state.loading) {
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

  return <ProductGrid items={state.items} pagination={state.pagination} />;
}
