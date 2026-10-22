import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { signInMock, pushMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  pushMock: vi.fn(),
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

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    // Auto-resolve captcha for tests
    queueMicrotask(() => onSuccess("test-captcha-token"));
    return null;
  },
}));

import RegisterPage from "./page";

beforeEach(() => {
  signInMock.mockReset();
  pushMock.mockReset();
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
});
