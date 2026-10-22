import Link from "next/link";
import { Button } from "@/components/ui/button";

interface IPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutErrorPage({ searchParams }: IPageProps) {
  const { orderId } = await searchParams;

  return (
    <main className="container mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="mb-2 text-3xl font-bold text-destructive">Pembayaran Gagal</h1>
      <p className="mb-6 text-muted-foreground">
        Terjadi kesalahan saat memproses pembayaran. Coba lagi atau hubungi admin.
      </p>
      {orderId ? (
        <Button asChild>
          <Link href={`/account/orders/${orderId}`}>Lihat Pesanan</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href="/shop">Kembali ke Belanja</Link>
        </Button>
      )}
    </main>
  );
}
