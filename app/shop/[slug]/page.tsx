import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { toProductView } from "@/lib/data/products";
import { ProductDetail } from "@/components/shop/ProductDetail";
import type { IProduct } from "@/types/shop";

interface IProductPageProps {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  return prisma.premiumHoneyCollection.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: IProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Produk tidak ditemukan — Zari Honey" };
  return {
    title: `${product.name} — Zari Honey`,
    description: product.description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: {
      title: `${product.name} — Zari Honey`,
      description: product.description.replace(/<[^>]+>/g, "").slice(0, 160),
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductSlugPage({ params }: IProductPageProps) {
  const { slug } = await params;
  const dbProduct = await loadProduct(slug);
  if (!dbProduct) notFound();

  const product: IProduct = {
    ...toProductView(dbProduct),
    // ProductDetail me-render deskripsi sebagai HTML; sanitize di server agar
    // sanitize-html tidak ikut ter-bundle ke client.
    description: sanitizeRichHtml(dbProduct.description),
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </main>
  );
}
