"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Loader2, Save, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const heroSchema = z.object({
  badges: z.array(z.string()).min(1, "Minimal 1 badge diperlukan"),
  typewriterTexts: z.array(z.string()).min(1, "Minimal 1 teks diperlukan"),
  description: z.string().optional(),
  productImage: z.string().nullable(),
});

type HeroFormData = z.infer<typeof heroSchema>;

export default function HeroContentPage() {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [badgeInput, setBadgeInput] = useState("");
  const [typewriterTexts, setTypewriterTexts] = useState<string[]>([]);
  const [typewriterInput, setTypewriterInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      badges: [],
      typewriterTexts: [],
      description: "",
      productImage: null,
    },
  });

  const description = watch("description");
  const productImage = watch("productImage");

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/hero-content");
        const data = await res.json();

        if (data) {
          setBadges(data.badges || []);
          setTypewriterTexts(data.typewriterTexts || []);
          setValue("badges", data.badges || []);
          setValue("typewriterTexts", data.typewriterTexts || []);
          setValue("description", data.description || "");
          setValue("productImage", data.productImage);
          setPreviewImage(data.productImage);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [setValue]);

  // Add badge
  const handleAddBadge = () => {
    if (badgeInput.trim() && badges.length < 5) {
      const newBadges = [...badges, badgeInput.trim()];
      setBadges(newBadges);
      setValue("badges", newBadges);
      setBadgeInput("");
    }
  };

  // Remove badge
  const handleRemoveBadge = (index: number) => {
    const newBadges = badges.filter((_, i) => i !== index);
    setBadges(newBadges);
    setValue("badges", newBadges);
  };

  // Add typewriter text
  const handleAddTypewriterText = () => {
    if (typewriterInput.trim() && typewriterTexts.length < 5) {
      const newTexts = [...typewriterTexts, typewriterInput.trim()];
      setTypewriterTexts(newTexts);
      setValue("typewriterTexts", newTexts);
      setTypewriterInput("");
    }
  };

  // Remove typewriter text
  const handleRemoveTypewriterText = (index: number) => {
    const newTexts = typewriterTexts.filter((_, i) => i !== index);
    setTypewriterTexts(newTexts);
    setValue("typewriterTexts", newTexts);
  };

  // Update typewriter text
  const handleUpdateTypewriterText = (index: number, value: string) => {
    const newTexts = [...typewriterTexts];
    newTexts[index] = value;
    setTypewriterTexts(newTexts);
    setValue("typewriterTexts", newTexts);
  };

  // Delete image
  const handleDeleteImage = () => {
    setValue("productImage", null);
    setPreviewImage(null);
    toast.success("Gambar berhasil dihapus");
  };

  // Check if form is valid for submission
  const isFormValid = badges.length >= 1 && typewriterTexts.length >= 1;

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 1MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format file harus JPEG, PNG, atau WebP");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setValue("productImage", data.url);
        setPreviewImage(data.url);
        toast.success("Gambar berhasil diupload");
      } else {
        toast.error(data.error || "Gagal upload gambar");
      }
    } catch (error) {
      toast.error("Gagal upload gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit form
  const onSubmit = async (data: HeroFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/hero-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Data berhasil disimpan!");
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kelola Hero Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Edit konten bagian hero di landing page
          </p>
        </div>
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Badges */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Badges / Tagline</h3>
            <p className="text-sm text-gray-600">
              Tambahkan badge atau tagline yang akan ditampilkan (Maksimal 5
              badges)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {badges.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddBadge())
                  }
                  placeholder="Contoh: 100% Raw Honey"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <Button
                  type="button"
                  onClick={handleAddBadge}
                  disabled={badges.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  className="bg-amber-100 text-amber-900 text-sm px-3 py-1 flex items-center gap-2"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => handleRemoveBadge(index)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {badges.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Belum ada badge. Klik &quot;Tambah&quot; untuk menambahkan.
              </p>
            )}

            {badges.length >= 5 && (
              <p className="text-sm text-amber-600">
                Maksimal 5 badges telah tercapai
              </p>
            )}

            {errors.badges && (
              <p className="text-red-600 text-sm">{errors.badges.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Typewriter Texts */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Judul Typewriter</h3>
            <p className="text-sm text-gray-600">
              Tambahkan teks animasi typewriter (Maksimal 5 teks)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new typewriter text */}
            {typewriterTexts.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typewriterInput}
                  onChange={(e) => setTypewriterInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTypewriterText();
                    }
                  }}
                  placeholder="Contoh: Madu Premium Asli dari Alam Indonesia"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <Button
                  type="button"
                  onClick={handleAddTypewriterText}
                  disabled={typewriterTexts.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>
            )}

            {/* Display existing typewriter texts */}
            <div className="space-y-3">
              {typewriterTexts.map((text, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-amber-100 text-amber-900 rounded font-semibold text-sm">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) =>
                      handleUpdateTypewriterText(index, e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveTypewriterText(index)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {typewriterTexts.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Belum ada teks typewriter. Klik &quot;Tambah&quot; untuk
                menambahkan.
              </p>
            )}

            {typewriterTexts.length >= 5 && (
              <p className="text-sm text-amber-600">
                Maksimal 5 teks telah tercapai
              </p>
            )}

            {errors.typewriterTexts && (
              <p className="text-red-600 text-sm">
                {errors.typewriterTexts.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">
              Deskripsi{" "}
              <span className="text-gray-400 text-sm font-normal">
                (Opsional)
              </span>
            </h3>
            <p className="text-sm text-gray-600">
              Teks deskriptif utama yang muncul di hero section
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Nikmati kemurnian alam dalam setiap tetes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {description?.length || 0} karakter
            </p>
            {errors.description && (
              <p className="text-red-600 text-sm mt-2">
                {errors.description.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">
              Gambar Produk{" "}
              <span className="text-gray-400 text-sm font-normal">
                (Opsional)
              </span>
            </h3>
            <p className="text-sm text-gray-600">
              Upload gambar produk (Max: 1MB, Format: JPEG/PNG/WebP)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih Gambar
                  </>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              {previewImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteImage}
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hapus Gambar
                </Button>
              )}
            </div>

            {previewImage && (
              <div className="relative w-64 h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-3">
          {!isFormValid && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Lengkapi minimal 1 badge dan 1 teks typewriter untuk
                mengaktifkan tombol simpan
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
