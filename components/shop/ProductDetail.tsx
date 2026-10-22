"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/CartProvider";
import type { IProduct } from "@/types/shop";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ProductDetail({ product }: { product: IProduct }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = !product.alwaysAvailable && product.stock <= 0;
  const maxQty = product.alwaysAvailable ? 99 : Math.min(product.stock, 99);

  const clamp = (n: number) => Math.max(1, Math.min(n, maxQty));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        {product.category ? (
          <nav className="text-sm text-muted-foreground">
            <Link href="/shop" className="hover:underline">
              Belanja
            </Link>
            {" › "}
            <Link
              href={`/shop/category/${product.category.slug}`}
              className="hover:underline"
            >
              {product.category.name}
            </Link>
          </nav>
        ) : null}
        <h1 className="text-3xl font-bold">{product.name}</h1>
        {product.label ? <Badge>{product.label}</Badge> : null}
        <p className="text-2xl font-bold text-primary">
          {formatRupiah(product.priceNumeric)}
        </p>
        <p className="text-sm">
          {outOfStock ? (
            <span className="text-destructive">Stok habis</span>
          ) : product.alwaysAvailable ? (
            <span className="text-green-700">Tersedia</span>
          ) : product.stock <= 5 ? (
            <span className="text-amber-700">
              Stok terbatas — {product.stock} tersisa
            </span>
          ) : (
            <span className="text-green-700">Tersedia ({product.stock})</span>
          )}
        </p>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity(clamp(quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Kurangi"
            >
              −
            </Button>
            <Input
              type="number"
              inputMode="numeric"
              className="h-8 w-14 border-0 text-center"
              value={quantity}
              onChange={(e) => setQuantity(clamp(parseInt(e.target.value, 10) || 1))}
              aria-label="Jumlah"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity(clamp(quantity + 1))}
              disabled={quantity >= maxQty}
              aria-label="Tambah"
            >
              +
            </Button>
          </div>
          <Button
            disabled={outOfStock}
            onClick={() => addItem(product.id, quantity)}
            className="flex-1"
          >
            {outOfStock ? "Stok habis" : "Tambah ke Keranjang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
