import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSidebarExpanded, __testing__ } from "./useSidebarExpanded";

const { SIDEBAR_EXPANDED_KEY } = __testing__;

beforeEach(() => {
  localStorage.clear();
});

describe("useSidebarExpanded", () => {
  it("defaults to expanded when nothing is stored", () => {
    const { result } = renderHook(() => useSidebarExpanded());
    expect(result.current[0]).toBe(true);
  });

  it("reads the persisted collapsed state", () => {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, "false");
    const { result } = renderHook(() => useSidebarExpanded());
    expect(result.current[0]).toBe(false);
  });

  it("toggle persists the value and updates every subscriber in the same tab", () => {
    const a = renderHook(() => useSidebarExpanded());
    const b = renderHook(() => useSidebarExpanded());

    act(() => a.result.current[1]());

    expect(localStorage.getItem(SIDEBAR_EXPANDED_KEY)).toBe("false");
    expect(a.result.current[0]).toBe(false);
    expect(b.result.current[0]).toBe(false);
  });

  it("follows changes made in another tab via the storage event", () => {
    const { result } = renderHook(() => useSidebarExpanded());
    act(() => {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, "false");
      window.dispatchEvent(new StorageEvent("storage", { key: SIDEBAR_EXPANDED_KEY }));
    });
    expect(result.current[0]).toBe(false);
  });
});
