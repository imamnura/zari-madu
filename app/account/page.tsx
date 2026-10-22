import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await auth();
  if (!session || session.user?.role !== "customer") {
    redirect("/login?returnTo=/account");
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Akun Saya</h1>
      <p className="mb-6 text-muted-foreground">Selamat datang, {session.user.name ?? session.user.email}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-auto justify-start p-4 text-left">
          <Link href="/account/orders">
            <div>
              <p className="font-semibold">Pesanan Saya</p>
              <p className="text-sm text-muted-foreground">Lihat riwayat pesanan</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start p-4 text-left">
          <Link href="/account/addresses">
            <div>
              <p className="font-semibold">Alamat Pengiriman</p>
              <p className="text-sm text-muted-foreground">Kelola alamat tersimpan</p>
            </div>
          </Link>
        </Button>
      </div>
    </main>
  );
}
