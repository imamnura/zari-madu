import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { signInMock, pushMock, toastErrorMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  pushMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ signIn: signInMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { error: toastErrorMock, success: vi.fn() } }));

import AdminLoginPage from "./page";

beforeEach(() => {
  signInMock.mockReset();
  pushMock.mockReset();
  toastErrorMock.mockReset();
});

function submit(email: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText("admin@zarilife.com"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: password } });
  fireEvent.submit(screen.getByPlaceholderText("admin@zarilife.com").closest("form")!);
}

describe("AdminLoginPage", () => {
  it("signs in with the admin-credentials provider (not the non-existent 'credentials')", async () => {
    signInMock.mockResolvedValue({ ok: true });
    render(<AdminLoginPage />);
    submit("admin@zarilife.com", "rahasia");

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(
        "admin-credentials",
        expect.objectContaining({
          email: "admin@zarilife.com",
          password: "rahasia",
          redirect: false,
        }),
      ),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/dashboard"));
  });

  it("maps the error code to a readable message", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin", code: "rate_limited", ok: false });
    render(<AdminLoginPage />);
    submit("admin@zarilife.com", "salah");

    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.",
      ),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
