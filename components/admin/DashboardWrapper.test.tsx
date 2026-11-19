import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/dashboard" }));
vi.mock("@/components/admin/AdminHeader", () => ({
  default: () => <header data-testid="admin-header" />,
}));

import DashboardWrapper from "./DashboardWrapper";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function contentContainer() {
  return screen.getByText("Konten").closest("main")!.parentElement!;
}

describe("DashboardWrapper", () => {
  it("does not poll localStorage on an interval", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    render(<DashboardWrapper user={{ name: "Admin" }}>Konten</DashboardWrapper>);
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("shifts the content padding immediately when the sidebar is collapsed and expanded", () => {
    render(<DashboardWrapper user={{ name: "Admin" }}>Konten</DashboardWrapper>);
    expect(contentContainer()).toHaveClass("lg:pl-64");

    fireEvent.click(screen.getByTitle("Collapse sidebar"));
    expect(contentContainer()).toHaveClass("lg:pl-20");
    expect(localStorage.getItem("sidebarExpanded")).toBe("false");

    fireEvent.click(screen.getByTitle("Expand sidebar"));
    expect(contentContainer()).toHaveClass("lg:pl-64");
  });

  it("restores the collapsed state saved from a previous visit", () => {
    localStorage.setItem("sidebarExpanded", "false");
    render(<DashboardWrapper user={{ name: "Admin" }}>Konten</DashboardWrapper>);
    expect(contentContainer()).toHaveClass("lg:pl-20");
  });
});
