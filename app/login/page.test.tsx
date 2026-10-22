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
  usePathname: () => "/login",
}));

import LoginPage from "./page";

beforeEach(() => {
  signInMock.mockReset();
  pushMock.mockReset();
});

describe("LoginPage", () => {
  it("submits to customer-credentials provider", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "sari@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /^masuk$/i }));
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("customer-credentials", {
        email: "sari@example.com",
        password: "secret123",
        redirect: false,
      });
    });
  });

  it("shows links to /register and /forgot-password", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /daftar/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /lupa password/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
