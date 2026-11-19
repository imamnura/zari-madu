"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressForm } from "@/components/checkout/AddressForm";
import { AddressCard } from "@/components/account/AddressCard";
import type { IAddressView } from "@/types/shop";
import type { GuestCheckoutInput } from "@/lib/schemas/shop";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<IAddressView[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [editing, setEditing] = useState<IAddressView | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = () => {
    fetch("/api/account/addresses", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setAddresses(j.data);
      });
  };

  useEffect(() => {
    refresh();
    fetch("/api/admin/shipping-rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setProvinces(j.data.map((r: { province: string }) => r.province));
      });
  }, []);

  const handleCreate = async (data: GuestCheckoutInput) => {
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Alamat tersimpan");
      setAdding(false);
      refresh();
    } else {
      toast.error(json.error ?? "Gagal menyimpan");
    }
  };

  const handleUpdate = async (id: string, data: GuestCheckoutInput) => {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Alamat diperbarui");
      setEditing(null);
      refresh();
    } else {
      toast.error(json.error ?? "Gagal memperbarui");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Alamat dihapus");
      refresh();
    } else {
      toast.error(json.error ?? "Gagal menghapus");
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    const json = await res.json();
    if (json.success) refresh();
    else toast.error(json.error ?? "Gagal");
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alamat Saya</h1>
        <Button onClick={() => setAdding(true)}>+ Tambah Alamat</Button>
      </header>

      {addresses.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 p-12 text-center text-muted-foreground">
          Belum ada alamat tersimpan
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setEditing(a)}
              onDelete={() => handleDelete(a.id)}
              onSetDefault={() => handleSetDefault(a.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alamat Baru</DialogTitle>
          </DialogHeader>
          <AddressForm
            provinces={provinces}
            showEmail={false}
            submitLabel="Simpan"
            onSubmit={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => (!open ? setEditing(null) : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alamat</DialogTitle>
          </DialogHeader>
          {editing ? (
            <AddressForm
              provinces={provinces}
              showEmail={false}
              defaultValues={{
                recipientName: editing.recipientName,
                phone: editing.phone,
                addressLine: editing.addressLine,
                rtRw: editing.rtRw ?? "",
                kelurahan: editing.kelurahan,
                kecamatan: editing.kecamatan,
                city: editing.city,
                province: editing.province,
                postalCode: editing.postalCode,
                email: "noop@noop.com",
              }}
              submitLabel="Update"
              onSubmit={(data) => handleUpdate(editing.id, data)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
