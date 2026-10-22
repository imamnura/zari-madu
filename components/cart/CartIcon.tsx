"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";

export function CartIcon() {
  const { cart, openDrawer } = useCart();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openDrawer}
      aria-label={`Keranjang (${cart.itemCount} item)`}
      className="relative"
    >
      <ShoppingCart className="size-5" />
      {cart.itemCount > 0 ? (
        <span
          data-testid="cart-badge"
          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
        >
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </span>
      ) : null}
    </Button>
  );
}
