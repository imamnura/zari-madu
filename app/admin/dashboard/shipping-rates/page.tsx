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
import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ShippingRateInput } from "@/lib/schemas/shop";

interface IRateRow {
  id: string;
  province: string;
  fee: number;
  estimatedDays: string | null;
  isActive: boolean;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function AdminShippingRatesPage() {
  const [rows, setRows] = useState<IRateRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<IRateRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = () => {
    fetch("/api/admin/shipping-rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setRows(j.data);
      });
  };
  useEffect(refresh, []);

  const handleCreate = async (data: ShippingRateInput) => {
    const res = await fetch("/api/admin/shipping-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Tarif disimpan");
      setAdding(false);
      refresh();
    } else toast.error(json.error ?? "Gagal");
  };
  const handleUpdate = async (id: string, data: ShippingRateInput) => {
    const res = await fetch(`/api/admin/shipping-rates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Tarif diperbarui");
      setEditing(null);
      refresh();
    } else toast.error(json.error ?? "Gagal");
  };
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/shipping-rates/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Tarif dihapus");
      refresh();
    } else toast.error(json.error ?? "Gagal");
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ongkos Kirim per Provinsi</h1>
        <Button onClick={() => setAdding(true)}>+ Tarif Baru</Button>
      </header>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Provinsi</th>
              <th className="px-3 py-2 text-right">Tarif</th>
              <th className="px-3 py-2">Estimasi</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.province}</td>
                <td className="px-3 py-2 text-right">{formatRupiah(r.fee)}</td>
                <td className="px-3 py-2">{r.estimatedDays ?? "—"}</td>
                <td className="px-3 py-2">{r.isActive ? "Aktif" : "Nonaktif"}</td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeletingId(r.id)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tarif Baru</DialogTitle>
          </DialogHeader>
          <ShippingRateForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(o) => (!o ? setEditing(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tarif</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ShippingRateForm
              defaultValues={{
                province: editing.province,
                fee: editing.fee,
                estimatedDays: editing.estimatedDays ?? "",
                isActive: editing.isActive,
              }}
              onSubmit={(data) => handleUpdate(editing.id, data)}
              submitLabel="Update"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => (!o ? setDeletingId(null) : null)}
        title="Hapus tarif ini?"
        confirmText="Hapus"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </div>
  );
}
