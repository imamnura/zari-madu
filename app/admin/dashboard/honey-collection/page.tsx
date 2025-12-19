"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Settings,
  Eye,
} from "lucide-react";
import { LoadingProgress } from "@/components/LoadingProgress";
import { toast } from "sonner";
import Link from "next/link";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";

interface HoneyCollection {
  id: string;
  name: string;
  description: string;
  price?: string;
  image?: string;
  label?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SectionContent {
  id: string;
  title: string;
  description: string;
}

export default function HoneyCollectionPage() {
  const [collections, setCollections] = useState<HoneyCollection[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent>({
    id: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isOpen, openDialog, closeDialog, dialogProps } = useConfirmDialog();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    label: "",
    image: "",
  });

  // Fetch section content
  const fetchSectionContent = async () => {
    try {
      const response = await fetch("/api/admin/honey-collection-content");
      const data = await response.json();

      if (data.success) {
        setSectionContent(data.data);
      }
    } catch (error) {
      console.error("Error fetching section content:", error);
    }
  };

  // Fetch collections
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/honey-collection");
      const data = await response.json();

      if (data.success) {
        setCollections(data.data);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Gagal mengambil data koleksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchSectionContent();
  }, []);

  // Handle section content update
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sectionContent.title || !sectionContent.description) {
      toast.error("Title dan description harus diisi");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/honey-collection-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sectionContent.title,
          description: sectionContent.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowSectionForm(false);
      } else {
        toast.error(data.error || "Gagal menyimpan section content");
      }
    } catch (error) {
      console.error("Error saving section content:", error);
      toast.error("Gagal menyimpan section content");
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 10MB");
      return;
    }

    // Check file type
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type
      )
    ) {
      toast.error("Format file harus JPEG, PNG, WebP, atau GIF");
      return;
    }

    try {
      setSaving(true);
      toast.info("Uploading image to Cloudinary...");

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "zari-honey/products");

      const response = await fetch("/api/admin/cloudinary-upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          image: data.url,
        }));
        toast.success("Gambar berhasil diupload!");
      } else {
        toast.error(data.error || "Gagal upload gambar");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal upload gambar");
    } finally {
      setSaving(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error("Nama dan deskripsi harus diisi");
      return;
    }

    try {
      setSaving(true);

      const url = "/api/admin/honey-collection";
      const method = editMode ? "PUT" : "POST";
      const body = editMode ? { ...formData, id: selectedId } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchCollections();
        resetForm();
      } else {
        toast.error(data.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving collection:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (collection: HoneyCollection) => {
    setEditMode(true);
    setSelectedId(collection.id);
    setFormData({
      name: collection.name,
      description: collection.description,
      price: collection.price || "",
      label: collection.label || "",
      image: collection.image || "",
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    openDialog({
      title: "Hapus Koleksi Madu",
      description:
        "Apakah Anda yakin ingin menghapus koleksi madu ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Ya, Hapus",
      onConfirm: async () => {
        try {
          setSaving(true);
          const response = await fetch(`/api/admin/honey-collection?id=${id}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            toast.success(data.message);
            fetchCollections();
          } else {
            toast.error(data.error || "Gagal menghapus data");
          }
        } catch (error) {
          console.error("Error deleting collection:", error);
          toast.error("Gagal menghapus data");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      label: "",
      image: "",
    });
    setShowForm(false);
    setEditMode(false);
    setSelectedId(null);
  };

  if (loading) {
    return <LoadingProgress />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Koleksi Madu Premium
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola produk koleksi madu premium Anda
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/#honey-collection" target="_blank">
            <Button
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button
            onClick={() => setShowSectionForm(!showSectionForm)}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Section
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Tutup Form" : "Tambah Koleksi"}
          </Button>
        </div>
      </div>

      {/* Section Content Form */}
      {showSectionForm && (
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle>Edit Section Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Section *
                </label>
                <input
                  type="text"
                  value={sectionContent.title}
                  onChange={(e) =>
                    setSectionContent({
                      ...sectionContent,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Koleksi Madu Premium"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Title yang akan muncul di landing page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description Section *
                </label>
                <textarea
                  value={sectionContent.description}
                  onChange={(e) =>
                    setSectionContent({
                      ...sectionContent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deskripsi singkat untuk section ini
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {saving ? "Menyimpan..." : "Simpan Section"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowSectionForm(false)}
                  variant="outline"
                  disabled={saving}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Collection Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editMode ? "Edit Koleksi Madu" : "Tambah Koleksi Madu"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Madu *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Contoh: Madu Hutan Liar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Deskripsi singkat tentang madu ini"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Contoh: Rp 150.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Contoh: Best Seller"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Produk (Opsional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {formData.image && (
                    <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Format: JPG, PNG. Maksimal 5MB
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {saving ? "Menyimpan..." : editMode ? "Update" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  disabled={saving}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              Belum ada koleksi madu. Tambahkan koleksi pertama Anda!
            </p>
          </div>
        ) : (
          collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              <div className="relative w-full h-48 bg-gradient-to-br from-amber-100 to-amber-200">
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-amber-400" />
                  </div>
                )}
                {collection.label && (
                  <Badge className="absolute top-2 left-2 bg-amber-600">
                    {collection.label}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {collection.description}
                </p>
                {collection.price && (
                  <p className="text-amber-600 font-semibold mb-3">
                    {collection.price}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(collection)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(collection.id)}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={closeDialog}
        onConfirm={dialogProps.onConfirm}
        title={dialogProps.title}
        description={dialogProps.description}
        confirmText={dialogProps.confirmText}
        cancelText={dialogProps.cancelText}
      />
    </div>
  );
}
