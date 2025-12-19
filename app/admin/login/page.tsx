"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LogIn, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Login berhasil!");
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowForgotPassword(false);
        setForgotEmail("");
      } else {
        toast.error(data.error || "Gagal mengirim permintaan reset");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-amber-200">
        <CardHeader className="text-center space-y-4 pb-8 pt-8">
          <div className="text-6xl mb-4">🍯</div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Zari Honey Management System</p>
        </CardHeader>

        <CardContent>
          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="admin@zarilife.com"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
                  >
                    Lupa Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-6 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Login
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Default login:</p>
                <p className="font-mono bg-gray-50 p-2 rounded mt-2">
                  admin@zarilife.com / admin123
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Lupa Password
                </h2>
                <p className="text-sm text-gray-600">
                  Masukkan email Anda untuk reset password
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="forgotEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    placeholder="admin@zarilife.com"
                    disabled={forgotLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-6 text-lg font-semibold"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5 mr-2" />
                        Kirim Permintaan
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail("");
                    }}
                    variant="outline"
                    className="w-full py-6 text-lg"
                    disabled={forgotLoading}
                  >
                    Kembali ke Login
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Untuk demo, silakan hubungi
                  administrator untuk reset password Anda.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
