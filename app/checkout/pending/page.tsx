import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

interface IPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutPendingPage({ searchParams }: IPageProps) {
  const { orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { orderNumber: true },
      })
    : null;

  return (
    <main className="container mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="mb-2 text-3xl font-bold">Menunggu Pembayaran</h1>
      <p className="mb-6 text-muted-foreground">
        Pesanan Anda terdaftar. Selesaikan pembayaran agar pesanan diproses.
      </p>
      {order ? (
        <p className="mb-6 text-lg">
          Nomor pesanan: <strong>{order.orderNumber}</strong>
        </p>
      ) : null}
      <Button asChild>
        <Link href="/account/orders">Lihat Pesanan Saya</Link>
      </Button>
    </main>
  );
}
