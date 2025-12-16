"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  Loader2,
  Save,
  Eye,
  Upload,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type Partnership = {
  id: number;
  name: string;
  logo: string;
  description: string;
};

const partnershipSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama partner harus diisi"),
  logo: z.string().min(1, "Logo harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
});

const partnershipContentSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  partnerships: z
    .array(partnershipSchema)
    .min(1, "Minimal harus ada 1 partner"),
});

type PartnershipFormData = z.infer<typeof partnershipContentSchema>;

export default function PartnershipsContentPage() {
  const [loading, setLoading] = useState(false);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [logoInput, setLogoInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showUploadInfo, setShowUploadInfo] = useState(false);

  // Debounced logo URL for preview
  const debouncedLogoUrl = useDebounce(logoInput, 500);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipContentSchema),
    defaultValues: {
      heading: "",
      title: "",
      partnerships: [],
    },
  });

  const heading = watch("heading");
  const title = watch("title");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch("/api/admin/partnership-content");
        if (res.ok) {
          const data = await res.json();
          setValue("heading", data.heading);
          setValue("title", data.title);
          setPartnerships(data.partnerships);
          setValue("partnerships", data.partnerships);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadContent();
  }, [setValue]);

  useEffect(() => {
    setValue("partnerships", partnerships);
  }, [partnerships, setValue]);

  const handleAddPartnership = () => {
    if (!nameInput || !logoInput || !descriptionInput) {
      toast.error("Semua field partner harus diisi");
      return;
    }

    const newPartnership = {
      id: editingIndex !== null ? partnerships[editingIndex].id : Date.now(),
      name: nameInput,
      logo: logoInput,
      description: descriptionInput,
    };

    if (editingIndex !== null) {
      const updated = [...partnerships];
      updated[editingIndex] = newPartnership;
      setPartnerships(updated);
      setEditingIndex(null);
      toast.success("Partner berhasil diupdate");
    } else {
      setPartnerships([...partnerships, newPartnership]);
      toast.success("Partner berhasil ditambahkan");
    }

    setNameInput("");
    setLogoInput("");
    setDescriptionInput("");
  };

  const handleEditPartnership = (index: number) => {
    const partnership = partnerships[index];
    setNameInput(partnership.name);
    setLogoInput(partnership.logo);
    setDescriptionInput(partnership.description);
    setEditingIndex(index);
  };

  const handleDeletePartnership = (index: number) => {
    setPartnerships(partnerships.filter((_, i) => i !== index));
    toast.success("Partner berhasil dihapus");
  };

  const handleCancelEdit = () => {
    setNameInput("");
    setLogoInput("");
    setDescriptionInput("");
    setEditingIndex(null);
  };

  const onSubmit = async (data: PartnershipFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/partnership-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Data berhasil disimpan!");
        window.location.reload();
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    heading?.length >= 5 && title?.length > 0 && partnerships.length >= 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kelola Partnership Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manajemen partner dan sertifikasi
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Heading Input */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Heading Section</h3>
            <p className="text-sm text-gray-600">
              Judul utama dari Partnership section
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("heading")}
                placeholder="Contoh: Partner & Sertifikasi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              {errors.heading && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.heading.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Title Input */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Subtitle</h3>
            <p className="text-sm text-gray-600">
              Subtitle atau deskripsi singkat
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Contoh: Dipercaya dan bersertifikat resmi dari berbagai lembaga terkemuka"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.title.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Partnerships Management */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Partners & Certifications</h3>
            <p className="text-sm text-gray-600">
              Kelola partner dan sertifikasi (minimal 1)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Form */}
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <h4 className="font-semibold mb-4 text-gray-900">
                {editingIndex !== null ? "Edit Partner" : "Tambah Partner Baru"}
              </h4>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Partner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Contoh: BPOM RI"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Logo Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Logo URL <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploadInfo(!showUploadInfo)}
                      className="text-xs h-auto py-1 px-2"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      {showUploadInfo ? "Sembunyikan" : "Cara Upload"}
                    </Button>
                  </div>

                  {showUploadInfo && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                      <p className="font-semibold text-blue-900">
                        📤 Cara Upload Logo ke Google Drive:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800">
                        <li>Upload gambar logo ke Google Drive</li>
                        <li>Klik kanan pada file → Get link</li>
                        <li>
                          Ubah akses menjadi &quot;Anyone with the link&quot;
                        </li>
                        <li>Copy link dan paste di form input di bawah</li>
                        <li>
                          Format link:{" "}
                          <code className="bg-blue-100 px-1 rounded">
                            https://drive.google.com/file/d/FILE_ID/view
                          </code>
                        </li>
                      </ol>
                      <p className="text-blue-700 mt-2">
                        💡 Atau gunakan link image dari URL lain (imgur, imgbb,
                        dll)
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={logoInput}
                      onChange={(e) => setLogoInput(e.target.value)}
                      placeholder="Paste URL Google Drive atau image URL lainnya"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Image Preview */}
                  {debouncedLogoUrl && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Preview Logo:
                      </p>
                      <div className="flex items-center justify-center bg-white p-4 rounded border border-gray-200">
                        <div className="relative w-24 h-24">
                          <Image
                            src={debouncedLogoUrl}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="flex items-center justify-center w-full h-full text-red-500 text-xs">❌ Invalid URL</div>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Contoh: Tersertifikasi dan terdaftar resmi"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddPartnership}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {editingIndex !== null ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Partner
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Partner
                    </>
                  )}
                </Button>

                {editingIndex !== null && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                )}
              </div>
            </div>

            {/* Partnerships List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Daftar Partner ({partnerships.length})
              </h4>

              {partnerships.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada partner. Tambahkan minimal 1 partner.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partnerships.map((partnership, index) => (
                    <div
                      key={partnership.id}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">🏆</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 text-sm">
                                {partnership.name}
                              </h5>
                              <p className="text-xs text-gray-600">
                                {partnership.description}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 truncate">
                            {partnership.logo}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPartnership(index)}
                            className="text-xs px-2 py-1 h-7"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePartnership(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1 h-7"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.partnerships && (
                <p className="text-red-600 text-sm">
                  {errors.partnerships.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Warning */}
        {!isFormValid && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Lengkapi form untuk menyimpan perubahan:
            </p>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
              {heading?.length < 5 && <li>Heading minimal 5 karakter</li>}
              {!title && <li>Title harus diisi</li>}
              {partnerships.length < 1 && <li>Minimal 1 partner</li>}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
