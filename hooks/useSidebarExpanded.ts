"use client";

import { useCallback, useSyncExternalStore } from "react";

const SIDEBAR_EXPANDED_KEY = "sidebarExpanded";
const SIDEBAR_EXPANDED_EVENT = "sidebar-expanded-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EXPANDED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EXPANDED_EVENT, callback);
  };
}

function getSnapshot(): boolean {
  return localStorage.getItem(SIDEBAR_EXPANDED_KEY) !== "false";
}

/**
 * State expand/collapse sidebar admin, disimpan di localStorage (default true, termasuk saat SSR).
 * Perubahan di tab yang sama diberitahukan lewat event, tab lain lewat event `storage`.
 */
export function useSidebarExpanded(): [boolean, () => void] {
  const isExpanded = useSyncExternalStore(subscribe, getSnapshot, () => true);

  const toggle = useCallback(() => {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(!getSnapshot()));
    window.dispatchEvent(new Event(SIDEBAR_EXPANDED_EVENT));
  }, []);

  return [isExpanded, toggle];
}

export const __testing__ = { SIDEBAR_EXPANDED_KEY };
