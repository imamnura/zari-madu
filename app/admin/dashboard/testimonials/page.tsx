"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2, Save, Eye, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";

type Testimonial = {
  id: number;
  name: string;
  city: string;
  text: string;
  rating: number;
};

const testimonialSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nama harus diisi"),
  city: z.string().min(1, "Kota harus diisi"),
  text: z.string().min(1, "Testimoni harus diisi"),
  rating: z.number().min(1).max(5, "Rating harus antara 1-5"),
});

const testimonialContentSchema = z.object({
  heading: z.string().min(5, "Heading minimal 5 karakter"),
  title: z.string().min(1, "Title harus diisi"),
  testimonials: z
    .array(testimonialSchema)
    .min(1, "Minimal harus ada 1 testimoni"),
});

type TestimonialFormData = z.infer<typeof testimonialContentSchema>;

export default function TestimonialsContentPage() {
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isOpen, openDialog, closeDialog, dialogProps } = useConfirmDialog();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialContentSchema),
    defaultValues: {
      heading: "",
      title: "",
      testimonials: [],
    },
  });

  // Watch for form changes
  const heading = watch("heading");
  const title = watch("title");

  // Load existing content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch("/api/admin/testimonial-content");
        if (res.ok) {
          const data = await res.json();
          setValue("heading", data.heading);
          setValue("title", data.title);
          setTestimonials(data.testimonials);
          setValue("testimonials", data.testimonials);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadContent();
  }, [setValue]);

  // Sync testimonials with form
  useEffect(() => {
    setValue("testimonials", testimonials);
  }, [testimonials, setValue]);

  // Add or update testimonial
  const handleAddTestimonial = () => {
    if (!nameInput || !cityInput || !textInput) {
      toast.error("Semua field testimoni harus diisi");
      return;
    }

    const newTestimonial = {
      id: editingIndex !== null ? testimonials[editingIndex].id : Date.now(),
      name: nameInput,
      city: cityInput,
      text: textInput,
      rating: ratingInput,
    };

    if (editingIndex !== null) {
      // Update existing testimonial
      const updated = [...testimonials];
      updated[editingIndex] = newTestimonial;
      setTestimonials(updated);
      setEditingIndex(null);
      toast.success("Testimoni berhasil diupdate");
    } else {
      // Add new testimonial
      setTestimonials([...testimonials, newTestimonial]);
      toast.success("Testimoni berhasil ditambahkan");
    }

    // Clear inputs
    setNameInput("");
    setCityInput("");
    setTextInput("");
    setRatingInput(5);
  };

  // Edit testimonial
  const handleEditTestimonial = (index: number) => {
    const testimonial = testimonials[index];
    setNameInput(testimonial.name);
    setCityInput(testimonial.city);
    setTextInput(testimonial.text);
    setRatingInput(testimonial.rating);
    setEditingIndex(index);
  };

  // Delete testimonial
  const handleDeleteTestimonial = (index: number) => {
    openDialog({
      title: "Hapus Testimoni",
      description:
        "Apakah Anda yakin ingin menghapus testimoni ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Ya, Hapus",
      onConfirm: () => {
        setTestimonials(testimonials.filter((_, i) => i !== index));
        toast.success("Testimoni berhasil dihapus");
      },
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setNameInput("");
    setCityInput("");
    setTextInput("");
    setRatingInput(5);
    setEditingIndex(null);
  };

  // Submit form
  const onSubmit = async (data: TestimonialFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/testimonial-content", {
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
    heading?.length >= 5 && title?.length > 0 && testimonials.length >= 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kelola Testimonials Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manajemen konten testimoni pelanggan
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
              Judul utama dari Testimonials section
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
                placeholder="Contoh: Apa Kata Mereka?"
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
                placeholder="Contoh: Ribuan pelanggan puas telah merasakan kualitas Zari Honey"
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

        {/* Testimonials Management */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Testimonials</h3>
            <p className="text-sm text-gray-600">
              Kelola testimoni pelanggan (minimal 1)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Form */}
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <h4 className="font-semibold mb-4 text-gray-900">
                {editingIndex !== null
                  ? "Edit Testimoni"
                  : "Tambah Testimoni Baru"}
              </h4>

              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Contoh: Ibu Sari"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* City Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimoni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Contoh: Madu Zari benar-benar premium! Rasanya berbeda dari madu biasa."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Rating Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= ratingInput
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {ratingInput} / 5
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddTestimonial}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {editingIndex !== null ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Testimoni
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Testimoni
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

            {/* Testimonials List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Daftar Testimoni ({testimonials.length})
              </h4>

              {testimonials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada testimoni. Tambahkan minimal 1 testimoni.
                </div>
              ) : (
                <div className="space-y-3">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-gray-900">
                              {testimonial.name}
                            </h5>
                            <span className="text-sm text-gray-500">
                              • {testimonial.city}
                            </span>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{testimonial.text}"
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTestimonial(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTestimonial(index)}
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

              {errors.testimonials && (
                <p className="text-red-600 text-sm">
                  {errors.testimonials.message}
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
              {testimonials.length < 1 && <li>Minimal 1 testimoni</li>}
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
