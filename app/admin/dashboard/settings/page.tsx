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
import { PasswordInput } from "@/components/ui/password-input";

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

const emailSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(1, "Password diperlukan untuk konfirmasi"),
});

const contactSchema = z.object({
  siteName: z.string().min(1, "Nama site harus diisi"),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 karakter"),
  instagram: z.string().url("Instagram harus berupa URL yang valid"),
  email: z.string().email("Email harus valid"),
  shopeeLink: z.string().url("Link Shopee harus berupa URL yang valid"),
  mapsLocation: z.string().url("Link Maps harus berupa URL yang valid"),
  mapsEmbed: z.string().min(10, "Embed code Maps harus diisi"),
  whatsappOrderMessage: z.string().min(10, "Pesan order minimal 10 karakter"),
  whatsappResellerMessage: z
    .string()
    .min(10, "Pesan reseller minimal 10 karakter"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

export default function SettingsPage() {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [fetchingContact, setFetchingContact] = useState(true);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      siteName: "",
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
            siteName: data.siteName || "",
            whatsapp: data.whatsapp || "",
            instagram: data.instagram || "",
            email: data.email || "",
            shopeeLink: data.shopeeLink || "",
            mapsLocation: data.mapsLocation || "",
            mapsEmbed: data.mapsEmbed || "",
            whatsappOrderMessage:
              data.whatsappOrderMessage ||
              "Halo Zari, saya tertarik memesan madu premium. Mohon info detail & harganya.",
            whatsappResellerMessage:
              data.whatsappResellerMessage ||
              "Halo Zari, saya tertarik menjadi reseller premium. Mohon informasi lebih lanjut.",
          });
        }

        // Fetch admin email
        const adminRes = await fetch("/api/admin/get-email");
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setCurrentAdminEmail(adminData.email);
          emailForm.setValue("email", adminData.email);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setFetchingContact(false);
      }
    };

    fetchSettings();
  }, [contactForm, emailForm]);

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

  const onEmailSubmit = async (data: EmailFormData) => {
    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/change-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Email berhasil diubah!");
        setCurrentAdminEmail(data.email);
        emailForm.reset({ email: data.email, password: "" });
      } else {
        toast.error(result.error || "Gagal mengubah email");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setEmailLoading(false);
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
                {/* Site Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="siteName"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Globe className="w-4 h-4 text-amber-600" />
                    Nama Website
                  </label>
                  <input
                    {...contactForm.register("siteName")}
                    id="siteName"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="Zari Honey"
                  />
                  {contactForm.formState.errors.siteName && (
                    <p className="text-red-600 text-sm">
                      {contactForm.formState.errors.siteName.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Nama ini akan muncul di header website
                  </p>
                </div>

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

                {/* WhatsApp Order Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsappOrderMessage"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Pesan WhatsApp - Order
                  </label>
                  <textarea
                    {...contactForm.register("whatsappOrderMessage")}
                    id="whatsappOrderMessage"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="Halo Zari, saya tertarik memesan madu premium..."
                  />
                  {contactForm.formState.errors.whatsappOrderMessage && (
                    <p className="text-red-600 text-sm">
                      {
                        contactForm.formState.errors.whatsappOrderMessage
                          .message
                      }
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Template pesan WhatsApp untuk tombol order
                  </p>
                </div>

                {/* WhatsApp Reseller Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsappResellerMessage"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Pesan WhatsApp - Reseller
                  </label>
                  <textarea
                    {...contactForm.register("whatsappResellerMessage")}
                    id="whatsappResellerMessage"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="Halo Zari, saya tertarik menjadi reseller premium..."
                  />
                  {contactForm.formState.errors.whatsappResellerMessage && (
                    <p className="text-red-600 text-sm">
                      {
                        contactForm.formState.errors.whatsappResellerMessage
                          .message
                      }
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Template pesan WhatsApp untuk tombol reseller
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

      {/* Admin Email Settings */}
      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ubah Email Login</h3>
                <p className="text-sm text-gray-600">
                  Perbarui email untuk login ke dashboard admin
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Email saat ini:</strong>{" "}
                {currentAdminEmail || "Memuat..."}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="newEmail"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Mail className="w-4 h-4 text-amber-600" />
                Email Baru
              </label>
              <input
                {...emailForm.register("email")}
                id="newEmail"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="admin@example.com"
              />
              {emailForm.formState.errors.email && (
                <p className="text-red-600 text-sm">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="emailConfirmPassword"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Lock className="w-4 h-4 text-amber-600" />
                Password (Untuk Konfirmasi)
              </label>
              <PasswordInput
                {...emailForm.register("password")}
                id="emailConfirmPassword"
                placeholder="Masukkan password Anda"
              />
              {emailForm.formState.errors.password && (
                <p className="text-red-600 text-sm">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Masukkan password untuk mengkonfirmasi perubahan email
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={emailLoading}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6"
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Ubah Email
                  </>
                )}
              </Button>
            </div>
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
              <PasswordInput
                {...passwordForm.register("currentPassword")}
                id="currentPassword"
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
              <PasswordInput
                {...passwordForm.register("newPassword")}
                id="newPassword"
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
              <PasswordInput
                {...passwordForm.register("confirmPassword")}
                id="confirmPassword"
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
