import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { replaceMock, searchParamsRef } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/shop",
  useSearchParams: () => searchParamsRef.current,
}));

import { useProductFilters, __testing__ } from "./useProductFilters";

beforeEach(() => {
  replaceMock.mockReset();
  searchParamsRef.current = new URLSearchParams();
});

describe("readFilters", () => {
  it("returns defaults for empty URL", () => {
    const f = __testing__.readFilters(new URLSearchParams());
    expect(f).toEqual({
      categories: [],
      priceMin: null,
      priceMax: null,
      label: null,
      sort: "newest",
      page: 1,
    });
  });

  it("parses categories as comma-separated array", () => {
    const f = __testing__.readFilters(
      new URLSearchParams("category=madu-hutan,madu-multiflora"),
    );
    expect(f.categories).toEqual(["madu-hutan", "madu-multiflora"]);
  });

  it("rejects invalid sort and label values", () => {
    const f = __testing__.readFilters(
      new URLSearchParams("sort=invalid&label=invalid"),
    );
    expect(f.sort).toBe("newest");
    expect(f.label).toBeNull();
  });
});

describe("buildQueryString", () => {
  it("omits sort=newest and page=1 from URL (defaults)", () => {
    const out = __testing__.buildQueryString(
      { sort: "newest", page: 1 },
      new URLSearchParams(),
    );
    expect(out).toBe("");
  });

  it("clears category param when set to empty array", () => {
    const out = __testing__.buildQueryString(
      { categories: [] },
      new URLSearchParams("category=madu-hutan"),
    );
    expect(out).toBe("");
  });
});

describe("useProductFilters", () => {
  it("setCategories writes ?category= and resets page", () => {
    searchParamsRef.current = new URLSearchParams("page=3");
    const { result } = renderHook(() => useProductFilters());
    act(() => {
      result.current.setCategories(["madu-hutan"]);
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/shop?category=madu-hutan",
      { scroll: false },
    );
  });

  it("setSort writes ?sort= when not newest", () => {
    const { result } = renderHook(() => useProductFilters());
    act(() => {
      result.current.setSort("price_asc");
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/shop?sort=price_asc",
      { scroll: false },
    );
  });

  it("setPage preserves page param when > 1 and does not double-reset", () => {
    const { result } = renderHook(() => useProductFilters());
    act(() => {
      result.current.setPage(5);
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/shop?page=5",
      { scroll: false },
    );
  });

  it("reset clears all params", () => {
    searchParamsRef.current = new URLSearchParams("category=x&sort=price_asc&page=3");
    const { result } = renderHook(() => useProductFilters());
    act(() => {
      result.current.reset();
    });
    expect(replaceMock).toHaveBeenCalledWith("/shop", { scroll: false });
  });
});
