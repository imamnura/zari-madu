"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  IFilterParams,
  LabelBadge,
  SortOption,
} from "@/types/shop";

const SORT_VALUES: readonly SortOption[] = [
  "newest",
  "price_asc",
  "price_desc",
  "name_asc",
] as const;

const LABEL_VALUES: readonly LabelBadge[] = ["bestseller", "new", "promo"];

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

function readFilters(params: URLSearchParams): IFilterParams {
  const rawCategory = params.get("category");
  const categories = rawCategory
    ? rawCategory
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const labelParam = params.get("label");
  const label =
    labelParam && (LABEL_VALUES as readonly string[]).includes(labelParam)
      ? (labelParam as LabelBadge)
      : null;

  const sortParam = params.get("sort");
  const sort =
    sortParam && (SORT_VALUES as readonly string[]).includes(sortParam)
      ? (sortParam as SortOption)
      : "newest";

  const pageRaw = parsePositiveInt(params.get("page"));
  const page = pageRaw && pageRaw > 0 ? pageRaw : 1;

  return {
    categories,
    priceMin: parsePositiveInt(params.get("priceMin")),
    priceMax: parsePositiveInt(params.get("priceMax")),
    label,
    sort,
    page,
  };
}

function buildQueryString(filters: Partial<IFilterParams>, base: URLSearchParams): string {
  const next = new URLSearchParams(base.toString());

  if (filters.categories !== undefined) {
    if (filters.categories.length === 0) next.delete("category");
    else next.set("category", filters.categories.join(","));
  }
  if (filters.priceMin !== undefined) {
    if (filters.priceMin === null) next.delete("priceMin");
    else next.set("priceMin", String(filters.priceMin));
  }
  if (filters.priceMax !== undefined) {
    if (filters.priceMax === null) next.delete("priceMax");
    else next.set("priceMax", String(filters.priceMax));
  }
  if (filters.label !== undefined) {
    if (filters.label === null) next.delete("label");
    else next.set("label", filters.label);
  }
  if (filters.sort !== undefined) {
    if (filters.sort === "newest") next.delete("sort");
    else next.set("sort", filters.sort);
  }
  if (filters.page !== undefined) {
    if (filters.page <= 1) next.delete("page");
    else next.set("page", String(filters.page));
  }

  return next.toString();
}

export interface IUseProductFiltersResult {
  filters: IFilterParams;
  setCategories: (slugs: string[]) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setLabel: (label: LabelBadge | null) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

export function useProductFilters(): IUseProductFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apply = useCallback(
    (next: Partial<IFilterParams>, options?: { resetPage?: boolean }) => {
      const base = new URLSearchParams(searchParams.toString());
      const withPageReset =
        options?.resetPage === false ? next : { ...next, page: 1 };
      const qs = buildQueryString(withPageReset, base);
      const url = qs.length > 0 ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setCategories = useCallback(
    (slugs: string[]) => apply({ categories: slugs }),
    [apply],
  );
  const setPriceRange = useCallback(
    (min: number | null, max: number | null) =>
      apply({ priceMin: min, priceMax: max }),
    [apply],
  );
  const setLabel = useCallback(
    (label: LabelBadge | null) => apply({ label }),
    [apply],
  );
  const setSort = useCallback(
    (sort: SortOption) => apply({ sort }),
    [apply],
  );
  const setPage = useCallback(
    (page: number) => apply({ page }, { resetPage: false }),
    [apply],
  );
  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    setCategories,
    setPriceRange,
    setLabel,
    setSort,
    setPage,
    reset,
  };
}

export const __testing__ = { readFilters, buildQueryString };
