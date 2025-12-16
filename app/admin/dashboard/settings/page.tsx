"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  Lock,
  MessageCircle,
  Instagram,
  Mail,
  MapPin,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama harus diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
  });

const contactSchema = z.object({
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 karakter"),
  instagram: z.string().url("Instagram harus berupa URL yang valid"),
  email: z.string().email("Email harus valid"),
  shopeeLink: z.string().url("Link Shopee harus berupa URL yang valid"),
  mapsLocation: z.string().url("Link Maps harus berupa URL yang valid"),
  mapsEmbed: z.string().min(10, "Embed code Maps harus diisi"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

export default function SettingsPage() {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [fetchingContact, setFetchingContact] = useState(true);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsapp: "",
      instagram: "",
      email: "",
      shopeeLink: "",
      mapsLocation: "",
      mapsEmbed: "",
    },
  });

  // Fetch existing contact settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          contactForm.reset({
            whatsapp: data.whatsapp || "",
            instagram: data.instagram || "",
            email: data.email || "",
            shopeeLink: data.shopeeLink || "",
            mapsLocation: data.mapsLocation || "",
            mapsEmbed: data.mapsEmbed || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setFetchingContact(false);
      }
    };

    fetchSettings();
  }, [contactForm]);

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Password berhasil diubah!");
        passwordForm.reset();
      } else {
        toast.error(result.error || "Gagal mengubah password");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const onContactSubmit = async (data: ContactFormData) => {
    setContactLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Pengaturan kontak berhasil diperbarui!");
      } else {
        toast.error(result.error || "Gagal memperbarui pengaturan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan</h1>
        <p className="text-gray-600">
          Kelola akun dan informasi kontak website
        </p>
      </div>

      {/* Contact Information Settings */}
      <form onSubmit={contactForm.handleSubmit(onContactSubmit)}>
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-lg">
                <Globe className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Informasi Kontak</h3>
                <p className="text-sm text-gray-600">
                  Perbarui informasi kontak yang ditampilkan di website
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fetchingContact ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <>
                {/* WhatsApp */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsapp"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Nomor WhatsApp
                  </label>
                  <input
                    {...contactForm.register("whatsapp")}
                    id="whatsapp"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="+628123456789"
                  />
                  {contactForm.formState.errors.whatsapp && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.whatsapp.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Format: +62 diikuti nomor (contoh: +628123456789)
                  </p>
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <label
                    htmlFor="instagram"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Link Instagram
                  </label>
                  <input
                    {...contactForm.register("instagram")}
                    id="instagram"
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="https://www.instagram.com/username"
                  />
                  {contactForm.formState.errors.instagram && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.instagram.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email
                  </label>
                  <input
                    {...contactForm.register("email")}
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="info@zarilife.com"
                  />
                  {contactForm.formState.errors.email && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Shopee Link */}
                <div className="space-y-2">
                  <label
                    htmlFor="shopeeLink"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                    Link Toko Shopee
                  </label>
                  <input
                    {...contactForm.register("shopeeLink")}
                    id="shopeeLink"
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="https://shopee.co.id/shop/..."
                  />
                  {contactForm.formState.errors.shopeeLink && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.shopeeLink.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Link ini akan digunakan di tombol &quot;Pesan Sekarang&quot;
                  </p>
                </div>

                {/* Maps Location */}
                <div className="space-y-2">
                  <label
                    htmlFor="mapsLocation"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <MapPin className="w-4 h-4 text-red-600" />
                    Link Google Maps
                  </label>
                  <input
                    {...contactForm.register("mapsLocation")}
                    id="mapsLocation"
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                  {contactForm.formState.errors.mapsLocation && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.mapsLocation.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Link lokasi yang bisa dibagikan (Share Link)
                  </p>
                </div>

                {/* Maps Embed */}
                <div className="space-y-2">
                  <label
                    htmlFor="mapsEmbed"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <MapPin className="w-4 h-4 text-red-600" />
                    Embed Code Google Maps
                  </label>
                  <textarea
                    {...contactForm.register("mapsEmbed")}
                    id="mapsEmbed"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-sm"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  {contactForm.formState.errors.mapsEmbed && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.mapsEmbed.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Kode embed dari Google Maps (Share → Embed a map → Copy
                    HTML)
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={contactLoading}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6"
                  >
                    {contactLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Simpan Pengaturan Kontak
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Password Settings */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ubah Password</h3>
                <p className="text-sm text-gray-600">
                  Perbarui password akun admin Anda
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Password Lama
              </label>
              <input
                {...passwordForm.register("currentPassword")}
                id="currentPassword"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Masukkan password lama"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-600 text-sm">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Password Baru
              </label>
              <input
                {...passwordForm.register("newPassword")}
                id="newPassword"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Masukkan password baru"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-600 text-sm">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Konfirmasi Password Baru
              </label>
              <input
                {...passwordForm.register("confirmPassword")}
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Konfirmasi password baru"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-600 text-sm">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={passwordLoading}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Simpan Password Baru
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
