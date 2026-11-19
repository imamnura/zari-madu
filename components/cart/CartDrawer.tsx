"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "./CartLineItem";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CartDrawer() {
  const { cart, isDrawerOpen, openDrawer, closeDrawer } = useCart();
  const hasItems = cart.items.length > 0;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja</SheetTitle>
        </SheetHeader>
        {!hasItems ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Keranjang Anda masih kosong
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y">
            {cart.items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>
        )}
        <SheetFooter className="flex-col gap-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="text-lg font-bold">{formatRupiah(cart.subtotal)}</span>
          </div>
          <SheetClose asChild>
            <Button asChild disabled={!hasItems} className="w-full">
              <Link href={hasItems ? "/checkout" : "#"} aria-disabled={!hasItems}>
                Checkout
              </Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
