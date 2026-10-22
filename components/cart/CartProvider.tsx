"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type {
  ICartView,
  ICartItemView,
  IGuestCartEntry,
} from "@/types/shop";

const GUEST_STORAGE_KEY = "zari_cart_v1";

interface IApiCartResponse {
  success: boolean;
  data?: ICartView | null;
  error?: string;
}

interface IMergeResponse {
  success: boolean;
  data?: {
    mergedItemCount: number;
    droppedItems: Array<{ productId: string; reason: "out_of_stock" }>;
  };
  error?: string;
}

interface ICartContextValue {
  cart: ICartView;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_CART: ICartView = {
  id: null,
  items: [],
  subtotal: 0,
  itemCount: 0,
};

const CartContext = createContext<ICartContextValue | null>(null);

function readGuestStorage(): IGuestCartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is IGuestCartEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as IGuestCartEntry).productId === "string" &&
        typeof (e as IGuestCartEntry).quantity === "number",
    );
  } catch {
    return [];
  }
}

function clearGuestStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_STORAGE_KEY);
}

async function fetchCart(): Promise<ICartView> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  const json = (await res.json()) as IApiCartResponse;
  if (!json.success || !json.data) return EMPTY_CART;
  return json.data;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<ICartView>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hasMergedRef = useRef(false);
  const prevStatusRef = useRef<typeof status | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await fetchCart();
      setCart(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "loading") return;

    if (
      status === "authenticated" &&
      prev !== "authenticated" &&
      !hasMergedRef.current
    ) {
      const guestItems = readGuestStorage();
      if (guestItems.length > 0) {
        hasMergedRef.current = true;
        (async () => {
          try {
            const res = await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: guestItems }),
            });
            const json = (await res.json()) as IMergeResponse;
            if (json.success) {
              clearGuestStorage();
              if (json.data?.droppedItems?.length) {
                toast.warning(
                  `${json.data.droppedItems.length} item dilepas dari keranjang (stok habis)`,
                );
              }
            }
          } catch (err) {
            console.error("[CartProvider] merge failed", err);
          } finally {
            await refresh();
          }
        })();
        return;
      }
    }

    void refresh();
  }, [status, refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const json = (await res.json()) as IApiCartResponse;
        if (!json.success) {
          toast.error(json.error ?? "Gagal menambah ke keranjang");
          return;
        }
        if (json.data) setCart(json.data);
        toast.success("Ditambahkan ke keranjang");
      } catch {
        toast.error("Gagal menambah ke keranjang");
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const snapshot = cart;
      const optimistic: ICartView = {
        ...cart,
        items: cart.items.map((it) =>
          it.id === cartItemId
            ? { ...it, quantity, lineTotal: quantity * it.unitPriceNumeric }
            : it,
        ),
      };
      optimistic.subtotal = optimistic.items.reduce(
        (acc, it) => acc + it.lineTotal,
        0,
      );
      optimistic.itemCount = optimistic.items.reduce(
        (acc, it) => acc + it.quantity,
        0,
      );
      setCart(optimistic);
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        const json = (await res.json()) as IApiCartResponse;
        if (!json.success) {
          setCart(snapshot);
          toast.error(json.error ?? "Gagal mengubah jumlah");
          return;
        }
        if (json.data) setCart(json.data);
      } catch {
        setCart(snapshot);
        toast.error("Gagal mengubah jumlah");
      }
    },
    [cart],
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const snapshot = cart;
      const optimistic: ICartView = {
        ...cart,
        items: cart.items.filter((it) => it.id !== cartItemId),
      };
      optimistic.subtotal = optimistic.items.reduce(
        (acc, it) => acc + it.lineTotal,
        0,
      );
      optimistic.itemCount = optimistic.items.reduce(
        (acc, it) => acc + it.quantity,
        0,
      );
      setCart(optimistic);
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}`, {
          method: "DELETE",
        });
        const json = (await res.json()) as IApiCartResponse;
        if (!json.success) {
          setCart(snapshot);
          toast.error(json.error ?? "Gagal menghapus");
          return;
        }
        if (json.data) setCart(json.data);
      } catch {
        setCart(snapshot);
        toast.error("Gagal menghapus");
      }
    },
    [cart],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo<ICartContextValue>(
    () => ({
      cart,
      isLoading,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      updateQuantity,
      removeItem,
      refresh,
    }),
    [
      cart,
      isLoading,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      updateQuantity,
      removeItem,
      refresh,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): ICartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart() must be used inside <CartProvider>");
  }
  return ctx;
}

export const __testing__ = {
  GUEST_STORAGE_KEY,
  EMPTY_CART,
  readGuestStorage,
  clearGuestStorage,
};

export type { ICartContextValue, ICartItemView };
