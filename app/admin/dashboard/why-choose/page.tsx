"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2, Save, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Icon options for selection
const ICON_OPTIONS = [
  { value: "ShieldCheck", label: "Shield Check (✓)" },
  { value: "Sparkles", label: "Sparkles (✨)" },
  { value: "Leaf", label: "Leaf (🍃)" },
  { value: "MapPin", label: "Map Pin (📍)" },
  { value: "Users", label: "Users (👥)" },
  { value: "Award", label: "Award (🏆)" },
  { value: "Heart", label: "Heart (❤️)" },
  { value: "Star", label: "Star (⭐)" },
  { value: "Zap", label: "Zap (⚡)" },
  { value: "Globe", label: "Globe (🌍)" },
];

type Criterion = {
  icon: string;
  title: string;
  description: string;
};

const criterionSchema = z.object({
  icon: z.string().min(1, "Icon harus diisi"),
  title: z.string().min(1, "Judul kriteria harus diisi"),
  description: z.string().min(1, "Deskripsi kriteria harus diisi"),
});

const whyChooseSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  criteria: z.array(criterionSchema).min(1, "Minimal harus ada 1 kriteria"),
});

type WhyChooseFormData = z.infer<typeof whyChooseSchema>;

export default function WhyChooseContentPage() {
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [iconInput, setIconInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WhyChooseFormData>({
    resolver: zodResolver(whyChooseSchema),
    defaultValues: {
      heading: "",
      title: "",
      criteria: [],
    },
  });

  // Watch for form changes
  const heading = watch("heading");
  const title = watch("title");

  // Load existing content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch("/api/admin/why-choose-content");
        if (res.ok) {
          const data = await res.json();
          setValue("heading", data.heading);
          setValue("title", data.title);
          setCriteria(data.criteria);
          setValue("criteria", data.criteria);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadContent();
  }, [setValue]);

  // Sync criteria with form
  useEffect(() => {
    setValue("criteria", criteria);
  }, [criteria, setValue]);

  // Add or update criterion
  const handleAddCriterion = () => {
    if (!iconInput || !titleInput || !descriptionInput) {
      toast.error("Semua field kriteria harus diisi");
      return;
    }

    const newCriterion = {
      icon: iconInput,
      title: titleInput,
      description: descriptionInput,
    };

    if (editingIndex !== null) {
      // Update existing criterion
      const updated = [...criteria];
      updated[editingIndex] = newCriterion;
      setCriteria(updated);
      setEditingIndex(null);
      toast.success("Kriteria berhasil diupdate");
    } else {
      // Add new criterion
      setCriteria([...criteria, newCriterion]);
      toast.success("Kriteria berhasil ditambahkan");
    }

    // Clear inputs
    setIconInput("");
    setTitleInput("");
    setDescriptionInput("");
  };

  // Edit criterion
  const handleEditCriterion = (index: number) => {
    const criterion = criteria[index];
    setIconInput(criterion.icon);
    setTitleInput(criterion.title);
    setDescriptionInput(criterion.description);
    setEditingIndex(index);
  };

  // Delete criterion
  const handleDeleteCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
    toast.success("Kriteria berhasil dihapus");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIconInput("");
    setTitleInput("");
    setDescriptionInput("");
    setEditingIndex(null);
  };

  // Submit form
  const onSubmit = async (data: WhyChooseFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/why-choose-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Data berhasil disimpan!");
        // Reload page to refresh data
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

  // Form validation for submit button
  const isFormValid =
    heading?.length >= 5 && title?.length > 0 && criteria.length >= 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kelola Why Choose Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manajemen konten mengapa memilih Zari Life
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
              Judul utama dari Why Choose section
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
                placeholder="Contoh: Mengapa Memilih Zari Life?"
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
                placeholder="Contoh: Komitmen kami pada kualitas dan kepuasan Anda"
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

        {/* Criteria Management */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Kriteria</h3>
            <p className="text-sm text-gray-600">
              Kelola alasan mengapa memilih Zari Life (minimal 1)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Form */}
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <h4 className="font-semibold mb-4 text-gray-900">
                {editingIndex !== null
                  ? "Edit Kriteria"
                  : "Tambah Kriteria Baru"}
              </h4>

              <div className="space-y-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={iconInput}
                    onChange={(e) => setIconInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Pilih Icon</option>
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Contoh: Jaminan Kemurnian"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Contoh: 100% madu murni tanpa campuran gula atau bahan lain"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddCriterion}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {editingIndex !== null ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Kriteria
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kriteria
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
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Daftar Kriteria ({criteria.length})
              </h4>

              {criteria.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada kriteria. Tambahkan minimal 1 kriteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-amber-600">
                              {criterion.icon}
                            </span>
                            <h5 className="font-semibold text-gray-900">
                              {criterion.title}
                            </h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            {criterion.description}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCriterion(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCriterion(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.criteria && (
                <p className="text-red-600 text-sm">
                  {errors.criteria.message}
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
              {criteria.length < 1 && <li>Minimal 1 kriteria</li>}
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
