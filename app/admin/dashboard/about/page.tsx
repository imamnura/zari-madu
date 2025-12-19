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

const aboutSchema = z.object({
  tagline: z.string().min(5, "Minimal 5 karakter"),
  heading: z.string().min(1, "Title about harus diisi"),
  body: z.string().min(1, "Description about harus diisi"),
  stats: z
    .array(
      z.object({
        value: z.string().min(1, "Value harus diisi"),
        label: z.string().min(1, "Label harus diisi"),
      })
    )
    .min(1, "Minimal 1 stat diperlukan"),
});

type AboutFormData = z.infer<typeof aboutSchema>;

interface Stat {
  value: string;
  label: string;
}

export default function AboutContentPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const [statValueInput, setStatValueInput] = useState("");
  const [statLabelInput, setStatLabelInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      tagline: "",
      heading: "",
      body: "",
      stats: [],
    },
  });

  const tagline = watch("tagline");
  const heading = watch("heading");
  const body = watch("body");

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/about-content");
        const data = await res.json();

        if (data) {
          setValue("tagline", data.tagline || "");
          setValue("heading", data.heading || "");
          setValue("body", data.body || "");
          setStats(data.stats || []);
          setValue("stats", data.stats || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [setValue]);

  // Add stat
  const handleAddStat = () => {
    if (statValueInput.trim() && statLabelInput.trim() && stats.length < 5) {
      const newStats = [
        ...stats,
        { value: statValueInput.trim(), label: statLabelInput.trim() },
      ];
      setStats(newStats);
      setValue("stats", newStats);
      setStatValueInput("");
      setStatLabelInput("");
    }
  };

  // Remove stat
  const handleRemoveStat = (index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    setStats(newStats);
    setValue("stats", newStats);
  };

  // Update stat
  const handleUpdateStat = (
    index: number,
    field: "value" | "label",
    value: string
  ) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
    setValue("stats", newStats);
  };

  // Check if form is valid for submission
  const isFormValid =
    tagline.length >= 5 &&
    heading.trim() !== "" &&
    body.trim() !== "" &&
    stats.length >= 1;

  // Submit form
  const onSubmit = async (data: AboutFormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/about-content", {
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
            Kelola About Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Edit konten bagian about di landing page
          </p>
        </div>
        <Link href="/#about" target="_blank">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tagline */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Tagline</h3>
            <p className="text-sm text-gray-600">
              Teks kecil di atas judul (contoh: &quot;Terpercaya &
              Berkualitas&quot;)
            </p>
          </CardHeader>
          <CardContent>
            <input
              {...register("tagline")}
              type="text"
              placeholder="Terpercaya & Berkualitas"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {tagline?.length || 0} karakter (minimal 5)
            </p>
            {errors.tagline && (
              <p className="text-red-600 text-sm mt-2">
                {errors.tagline.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Title About */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Title About</h3>
            <p className="text-sm text-gray-600">Judul utama di bagian about</p>
          </CardHeader>
          <CardContent>
            <input
              {...register("heading")}
              type="text"
              placeholder="Tentang Zari Honey"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {errors.heading && (
              <p className="text-red-600 text-sm mt-2">
                {errors.heading.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Description About */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Description About</h3>
            <p className="text-sm text-gray-600">
              Deskripsi lengkap tentang perusahaan
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              {...register("body")}
              rows={5}
              placeholder="Zari Honey hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {body?.length || 0} karakter
            </p>
            {errors.body && (
              <p className="text-red-600 text-sm mt-2">{errors.body.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats About */}
        <Card className="border-2">
          <CardHeader>
            <h3 className="font-bold text-lg">Stats About</h3>
            <p className="text-sm text-gray-600">
              Statistik perusahaan (Maksimal 5 stats)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new stat */}
            {stats.length < 5 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={statValueInput}
                      onChange={(e) => setStatValueInput(e.target.value)}
                      placeholder="1M+"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={statLabelInput}
                      onChange={(e) => setStatLabelInput(e.target.value)}
                      placeholder="Pelanggan Puas"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddStat}
                  disabled={
                    stats.length >= 5 ||
                    !statValueInput.trim() ||
                    !statLabelInput.trim()
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Stat
                </Button>
              </div>
            )}

            {/* Display existing stats */}
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-amber-100 text-amber-900 rounded font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) =>
                          handleUpdateStat(index, "value", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) =>
                          handleUpdateStat(index, "label", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveStat(index)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 mt-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {stats.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Belum ada stat. Tambahkan minimal 1 stat.
              </p>
            )}

            {stats.length >= 5 && (
              <p className="text-sm text-amber-600">
                Maksimal 5 stats telah tercapai
              </p>
            )}

            {errors.stats && (
              <p className="text-red-600 text-sm">{errors.stats.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-3">
          {!isFormValid && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Pastikan semua field terisi dengan benar dan minimal 1 stat
                untuk mengaktifkan tombol simpan
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
