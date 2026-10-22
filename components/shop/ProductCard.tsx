"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export function ProductCard({ product }: { product: IProduct }) {
  const { addItem } = useCart();
  const outOfStock = !product.alwaysAvailable && product.stock <= 0;

  return (
    <article
      data-testid="product-card"
      className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {product.label ? (
          <Badge className="absolute left-2 top-2">{product.label}</Badge>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/shop/${product.slug}`} className="font-semibold leading-tight">
          {product.name}
        </Link>
        <p className="text-lg font-bold text-primary">
          {formatRupiah(product.priceNumeric)}
        </p>
        {outOfStock ? (
          <p className="text-xs text-destructive">Stok habis</p>
        ) : product.stock > 0 && product.stock <= 5 && !product.alwaysAvailable ? (
          <p className="text-xs text-amber-700">
            Stok terbatas — {product.stock} tersisa
          </p>
        ) : null}
        <Button
          className="mt-auto"
          disabled={outOfStock}
          onClick={() => addItem(product.id, 1)}
        >
          {outOfStock ? "Stok habis" : "Tambah ke Keranjang"}
        </Button>
      </div>
    </article>
  );
}
