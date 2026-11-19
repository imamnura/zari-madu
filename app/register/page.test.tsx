import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { signInMock, pushMock, resetMock, getResponsePromiseMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  pushMock: vi.fn(),
  resetMock: vi.fn(),
  getResponsePromiseMock: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ signIn: signInMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/register",
}));

vi.mock("@marsidev/react-turnstile", async () => {
  const React = await import("react");
  return {
    // Captcha langsung "lolos" saat mount; ref meniru API widget (reset + token baru).
    Turnstile: React.forwardRef(function TurnstileMock(
      { onSuccess }: { onSuccess: (token: string) => void },
      ref: React.Ref<unknown>,
    ) {
      React.useImperativeHandle(ref, () => ({
        reset: resetMock,
        getResponsePromise: getResponsePromiseMock,
      }));
      // Halaman mengirim callback baru tiap render; panggil sekali saat mount saja.
      const onSuccessRef = React.useRef(onSuccess);
      React.useEffect(() => {
        queueMicrotask(() => onSuccessRef.current("test-captcha-token"));
      }, []);
      return null;
    }),
  };
});

import RegisterPage from "./page";

afterEach(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  signInMock.mockReset();
  pushMock.mockReset();
  resetMock.mockReset();
  getResponsePromiseMock.mockReset();
  vi.spyOn(global, "fetch").mockResolvedValue({
    json: async () => ({ success: true, data: { id: "cus_1" } }),
  } as unknown as Response);
});

describe("RegisterPage", () => {
  it("rejects password shorter than 8 chars (zod inline)", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/nama lengkap/i), "Sari");
    await user.type(screen.getByLabelText("Email"), "sari@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /daftar/i }));
    await waitFor(() => {
      expect(screen.getByText(/minimal 8 karakter/i)).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  async function fillAndSubmit() {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/nama lengkap/i), "Sari");
    await user.type(screen.getByLabelText("Email"), "sari@example.com");
    // Nomor HP diisi: form saat ini menolak HP kosong walau berlabel opsional (bug terpisah).
    await user.type(screen.getByLabelText(/no\. hp/i), "081234567890");
    await user.type(screen.getByLabelText(/password/i), "password-kuat-123");
    await user.click(screen.getByRole("button", { name: /daftar/i }));
  }

  it("logs in automatically with a fresh captcha token (the register token is single-use)", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    getResponsePromiseMock.mockResolvedValue("fresh-login-token");
    signInMock.mockResolvedValue({ ok: true });

    await fillAndSubmit();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/account"));
    expect(resetMock).toHaveBeenCalled();
    expect(signInMock).toHaveBeenCalledWith("customer-credentials", {
      email: "sari@example.com",
      password: "password-kuat-123",
      turnstileToken: "fresh-login-token",
      redirect: false,
    });
  });

  it("sends the user to /login with the email prefilled when auto-login fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    getResponsePromiseMock.mockRejectedValue(new Error("timeout"));
    signInMock.mockResolvedValue({ error: "CredentialsSignin", code: "captcha_failed", ok: false });

    await fillAndSubmit();

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/login?email=sari%40example.com"),
    );
    expect(signInMock).toHaveBeenCalledWith(
      "customer-credentials",
      expect.objectContaining({ turnstileToken: "" }),
    );
    expect(pushMock).not.toHaveBeenCalledWith("/account");
  });
});
