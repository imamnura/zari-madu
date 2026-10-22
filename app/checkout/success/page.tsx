import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

interface IPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

function whatsappLink(orderNumber: string): string {
  const phone = process.env.WHATSAPP_ADMIN_PHONE?.replace(/\D/g, "") || "6285777578827";
  const text = encodeURIComponent(
    `Halo Admin Zari Honey, saya baru saja menyelesaikan pembayaran untuk pesanan ${orderNumber}.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export default async function CheckoutSuccessPage({ searchParams }: IPageProps) {
  const { orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { orderNumber: true },
      })
    : null;

  return (
    <main className="container mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="mb-2 text-3xl font-bold text-primary">Terima kasih!</h1>
      <p className="mb-6 text-muted-foreground">
        Pembayaran Anda berhasil diproses.
      </p>
      {order ? (
        <p className="mb-6 text-lg">
          Nomor pesanan: <strong>{order.orderNumber}</strong>
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/shop">Belanja Lagi</Link>
        </Button>
        {order ? (
          <Button asChild variant="outline">
            <a href={whatsappLink(order.orderNumber)} target="_blank" rel="noreferrer">
              Hubungi Admin via WhatsApp
            </a>
          </Button>
        ) : null}
      </div>
    </main>
  );
}
