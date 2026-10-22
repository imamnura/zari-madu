"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { SavedAddressPicker } from "@/components/checkout/SavedAddressPicker";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import type { IAddressView } from "@/types/shop";
import type { GuestCheckoutInput } from "@/lib/schemas/shop";

interface ISnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}
declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks?: ISnapCallbacks) => void };
  }
}

const SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isCustomer = session?.user?.role === "customer";
  const { cart, isLoading, refresh } = useCart();

  const [provinces, setProvinces] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<IAddressView[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/shipping-rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProvinces(
            json.data
              .filter((r: { isActive: boolean }) => r.isActive)
              .map((r: { province: string }) => r.province),
          );
        }
      });
  }, []);

  useEffect(() => {
    if (!isCustomer) return;
    fetch("/api/account/addresses", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setSavedAddresses(json.data);
          const def = json.data.find((a: IAddressView) => a.isDefault);
          if (def) setSelectedAddressId(def.id);
        }
      });
  }, [isCustomer]);

  useEffect(() => {
    if (!isLoading && cart.items.length === 0) {
      router.replace("/shop");
    }
  }, [isLoading, cart.items.length, router]);

  const handleCheckout = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Gagal memproses checkout");
        return;
      }
      if (!snapReady || !window.snap) {
        toast.error("Sistem pembayaran belum siap. Coba lagi.");
        return;
      }
      window.snap.pay(json.data.snapToken, {
        onSuccess: () => {
          refresh();
          router.push(`/checkout/success?orderId=${json.data.orderId}`);
        },
        onPending: () => {
          refresh();
          router.push(`/checkout/pending?orderId=${json.data.orderId}`);
        },
        onError: () => {
          router.push(`/checkout/error?orderId=${json.data.orderId}`);
        },
        onClose: () => {
          toast.info(
            "Pembayaran dibatalkan. Pesanan masih tersimpan dengan status PENDING.",
          );
        },
      });
    } catch {
      toast.error("Gagal memproses checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const submitGuest = (data: GuestCheckoutInput) => handleCheckout(data);

  const submitCustomerSaved = () => {
    if (!selectedAddressId) {
      toast.error("Pilih alamat pengiriman");
      return;
    }
    handleCheckout({ addressId: selectedAddressId });
  };

  const submitCustomerNewAddress = (data: GuestCheckoutInput, saveNewAddress: boolean) => {
    handleCheckout({ newAddress: data, saveNewAddress });
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Memuat...</p>
      </main>
    );
  }

  return (
    <>
      <Script
        src={SNAP_SRC}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setSnapReady(true)}
        strategy="afterInteractive"
      />
      <main className="container mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          {isCustomer ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Pilih alamat pengiriman</h2>
              <SavedAddressPicker
                addresses={savedAddresses}
                provinces={provinces}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onAddNew={async (data) => {
                  await submitCustomerNewAddress(data, true);
                }}
              />
              <Button onClick={submitCustomerSaved} disabled={submitting || !selectedAddressId}>
                {submitting ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </div>
          ) : (
            <AddressForm
              provinces={provinces}
              onSubmit={submitGuest}
              submitLabel={submitting ? "Memproses..." : "Bayar Sekarang"}
            />
          )}
        </section>
        <OrderSummary items={cart.items} shippingFee={0} />
      </main>
    </>
  );
}
