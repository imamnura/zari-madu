import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryForm } from "./CategoryForm";

describe("CategoryForm", () => {
  it("auto-derives slug from name when slug is empty", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={vi.fn()} />);
    const nameInput = screen.getByLabelText(/nama kategori/i) as HTMLInputElement;
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    await user.type(nameInput, "Madu Hutan Liar");
    await waitFor(() => {
      expect(slugInput.value).toBe("madu-hutan-liar");
    });
  });

  it("submits valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CategoryForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nama kategori/i), "Madu Hutan");
    await user.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const args = onSubmit.mock.calls[0][0];
    expect(args.name).toBe("Madu Hutan");
    expect(args.slug).toBe("madu-hutan");
  });
});
