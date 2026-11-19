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
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CategoryInput } from "@/lib/schemas/shop";

interface ICategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<ICategoryRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ICategoryRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = () => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setRows(j.data);
      });
  };
  useEffect(refresh, []);

  const handleCreate = async (data: CategoryInput) => {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Kategori dibuat");
      setAdding(false);
      refresh();
    } else toast.error(json.error ?? "Gagal");
  };
  const handleUpdate = async (id: string, data: CategoryInput) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Kategori diperbarui");
      setEditing(null);
      refresh();
    } else toast.error(json.error ?? "Gagal");
  };
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Kategori dihapus");
      refresh();
    } else toast.error(json.error ?? "Gagal");
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategori Produk</h1>
        <Button onClick={() => setAdding(true)}>+ Kategori Baru</Button>
      </header>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">Slug</th>
              <th className="px-3 py-2 text-center">Produk</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.slug}</td>
                <td className="px-3 py-2 text-center">{r._count?.products ?? 0}</td>
                <td className="px-3 py-2 text-center">{r.isActive ? "Aktif" : "Nonaktif"}</td>
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
            <DialogTitle>Kategori Baru</DialogTitle>
          </DialogHeader>
          <CategoryForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(o) => (!o ? setEditing(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CategoryForm
              defaultValues={editing}
              onSubmit={(data) => handleUpdate(editing.id, data)}
              submitLabel="Update"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(o) => (!o ? setDeletingId(null) : null)}
        title="Hapus kategori ini?"
        description="Jika masih ada produk yang terhubung, penghapusan akan ditolak."
        confirmText="Hapus"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </div>
  );
}
