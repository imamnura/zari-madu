import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "./sheet";

describe("Sheet", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Buka keranjang</SheetTrigger>
        <SheetContent>
          <SheetTitle>Keranjang</SheetTitle>
          <div>isi keranjang</div>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.queryByText("isi keranjang")).not.toBeInTheDocument();
    await user.click(screen.getByText("Buka keranjang"));
    expect(await screen.findByText("isi keranjang")).toBeInTheDocument();
  });

  it("applies side variant via data-side attribute", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>open</SheetTrigger>
        <SheetContent side="left" data-testid="sheet-left">
          <SheetTitle>Filter</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText("open"));
    const content = await screen.findByTestId("sheet-left");
    expect(content).toHaveAttribute("data-side", "left");
  });
});
