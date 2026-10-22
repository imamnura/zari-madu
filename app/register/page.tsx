"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  registerCustomerSchema,
  type RegisterCustomerInput,
} from "@/lib/schemas/shop";

export default function RegisterPage() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterCustomerInput>({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      turnstileToken: "",
    },
  });

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const onSubmit = async (data: RegisterCustomerInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Pendaftaran gagal");
        turnstileRef.current?.reset();
        return;
      }
      toast.success("Pendaftaran berhasil. Mengarahkan...");
      await signIn("customer-credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/account");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Daftar Akun</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="name">Nama Lengkap</label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="phone">No. HP (opsional)</label>
          <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">Password (min 8 karakter)</label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        {siteKey ? (
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={(token) =>
              setValue("turnstileToken", token, { shouldValidate: true })
            }
          />
        ) : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Memproses..." : "Daftar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </main>
  );
}
