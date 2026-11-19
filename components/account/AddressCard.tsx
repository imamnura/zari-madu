"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { IAddressView } from "@/types/shop";

interface IAddressCardProps {
  address: IAddressView;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  onSetDefault: (id: string) => void | Promise<void>;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: IAddressCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <article
        data-testid="address-card"
        className="space-y-2 rounded-lg border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">
              {address.recipientName}
              {address.isDefault ? (
                <span className="ml-2 text-xs text-primary">(Utama)</span>
              ) : null}
            </p>
            <p className="text-sm">{address.phone}</p>
          </div>
          {!address.isDefault ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetDefault(address.id)}
              data-testid="set-default-btn"
            >
              Jadikan utama
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {address.addressLine}, {address.kelurahan}, {address.kecamatan},{" "}
          {address.city}, {address.province} {address.postalCode}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(address.id)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-destructive"
          >
            Hapus
          </Button>
        </div>
      </article>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus alamat ini?"
        description="Tindakan ini tidak bisa dibatalkan."
        confirmText="Hapus"
        onConfirm={() => onDelete(address.id)}
      />
    </>
  );
}
