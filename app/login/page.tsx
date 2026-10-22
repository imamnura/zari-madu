"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await signIn("customer-credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Email atau password salah");
        return;
      }
      router.push(returnTo);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Masuk</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>
      {hasGoogle ? (
        <>
          <div className="my-6 text-center text-sm text-muted-foreground">atau</div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: returnTo })}
          >
            Masuk dengan Google
          </Button>
        </>
      ) : null}
      <div className="mt-6 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Lupa password?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Daftar
        </Link>
      </div>
    </main>
  );
}
