"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddressForm } from "./AddressForm";
import type { IAddressView } from "@/types/shop";
import type { GuestCheckoutInput } from "@/lib/schemas/shop";

interface ISavedAddressPickerProps {
  addresses: IAddressView[];
  provinces: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddNew: (data: GuestCheckoutInput) => void | Promise<void>;
}

export function SavedAddressPicker({
  addresses,
  provinces,
  selectedId,
  onSelect,
  onAddNew,
}: ISavedAddressPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3" data-testid="saved-address-picker">
      <ul className="space-y-2">
        {addresses.map((addr) => (
          <li key={addr.id}>
            <label className="flex cursor-pointer gap-3 rounded-md border p-3 hover:bg-accent">
              <input
                type="radio"
                name="saved-address"
                checked={selectedId === addr.id}
                onChange={() => onSelect(addr.id)}
                className="mt-1"
              />
              <div className="flex-1 text-sm">
                <p className="font-medium">
                  {addr.recipientName}
                  {addr.isDefault ? (
                    <span className="ml-2 text-xs text-primary">(Utama)</span>
                  ) : null}
                </p>
                <p>{addr.phone}</p>
                <p className="text-muted-foreground">
                  {addr.addressLine}, {addr.kelurahan}, {addr.kecamatan},{" "}
                  {addr.city}, {addr.province} {addr.postalCode}
                </p>
              </div>
            </label>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            + Tambah alamat baru
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alamat Baru</DialogTitle>
          </DialogHeader>
          <AddressForm
            provinces={provinces}
            showEmail={false}
            submitLabel="Simpan alamat"
            onSubmit={async (data) => {
              await onAddNew(data);
              onSelect(null);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
