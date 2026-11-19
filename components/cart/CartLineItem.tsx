"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import type { ICartItemView } from "@/types/shop";
import { X } from "lucide-react";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CartLineItem({ item }: { item: ICartItemView }) {
  const { updateQuantity, removeItem } = useCart();
  const maxQty = item.alwaysAvailable
    ? 99
    : Math.min(item.stockRemaining + item.quantity, 99);

  return (
    <div className="flex gap-3 py-3" data-testid="cart-line-item">
      <div className="size-16 shrink-0 overflow-hidden rounded bg-muted">
        {item.productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.productImage} alt={item.productName} className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium leading-tight">{item.productName}</p>
        <p className="text-sm text-muted-foreground">
          {formatRupiah(item.unitPriceNumeric)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={item.quantity <= 1}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Kurangi"
          >
            −
          </Button>
          <span className="min-w-8 text-center text-sm" data-testid="qty-display">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={item.quantity >= maxQty}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Tambah"
          >
            +
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => removeItem(item.id)}
          aria-label="Hapus"
        >
          <X className="size-4" />
        </Button>
        <p className="text-sm font-semibold">{formatRupiah(item.lineTotal)}</p>
      </div>
    </div>
  );
}
