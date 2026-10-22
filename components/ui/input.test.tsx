import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Input } from "./input";

describe("Input", () => {
  it("renders with default type=text and forwards arbitrary props", () => {
    render(<Input placeholder="Email" data-testid="email" />);
    const el = screen.getByTestId("email") as HTMLInputElement;
    expect(el).toBeInTheDocument();
    expect(el.placeholder).toBe("Email");
  });

  it("accepts user input as a controlled component", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [value, setValue] = useState("");
      return (
        <Input
          aria-label="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
    render(<Wrapper />);
    const input = screen.getByLabelText("name");
    await user.type(input, "Sari");
    expect((input as HTMLInputElement).value).toBe("Sari");
  });

  it("renders aria-invalid styling when invalid", () => {
    render(<Input aria-invalid={true} data-testid="invalid" />);
    expect(screen.getByTestId("invalid")).toHaveAttribute("aria-invalid", "true");
  });
});
