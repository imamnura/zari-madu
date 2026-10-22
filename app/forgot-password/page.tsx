"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        toast.error(json.error ?? "Permintaan gagal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Lupa Password</h1>
      {submitted ? (
        <div className="rounded-lg border bg-muted/30 p-6">
          <p className="text-sm">
            Jika email Anda terdaftar, instruksi reset akan kami kirim. Periksa
            inbox dan folder spam Anda.
          </p>
          <Link href="/login" className="mt-4 inline-block text-primary hover:underline">
            Kembali ke login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Masukkan email akun Anda. Kami akan kirim instruksi reset password.
          </p>
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Mengirim..." : "Kirim Instruksi"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Kembali ke login
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
