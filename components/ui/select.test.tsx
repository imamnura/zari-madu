import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("opens, lists options, and invokes onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="province">
          <SelectValue placeholder="Pilih provinsi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
          <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByLabelText("province"));
    const option = await screen.findByText("Jawa Barat");
    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith("Jawa Barat");
  });
});
