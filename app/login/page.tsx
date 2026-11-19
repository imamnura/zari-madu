"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage } from "@/lib/auth-errors";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

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
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const captchaRequired = Boolean(turnstileSiteKey);
  const [submitting, setSubmitting] = useState(false);

  const hasGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaRequired && !turnstileToken) {
      toast.error("Selesaikan verifikasi captcha terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const res = await signIn("customer-credentials", {
        email,
        password,
        turnstileToken: turnstileToken ?? "",
        redirect: false,
      });
      if (res?.error) {
        toast.error(authErrorMessage(res.code));
        // Token Turnstile sekali pakai: minta token baru untuk percobaan berikutnya.
        setTurnstileToken(null);
        turnstileRef.current?.reset();
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
        {turnstileSiteKey ? (
          <div className="flex min-h-[65px] justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => {
                setTurnstileToken(null);
                toast.error("Captcha gagal dimuat. Coba refresh halaman.");
              }}
              options={{ language: "id", theme: "light", size: "flexible" }}
            />
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={submitting || (captchaRequired && !turnstileToken)}
          className="w-full"
        >
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
