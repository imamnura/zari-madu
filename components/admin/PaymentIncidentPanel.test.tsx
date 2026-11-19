import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentIncidentPanel, type IPaymentIncidentView } from "./PaymentIncidentPanel";

const openIncident: IPaymentIncidentView = {
  id: "inc1",
  type: "PAID_AFTER_CANCEL",
  transactionId: "tx-1",
  grossAmount: 150000,
  createdAt: "2026-11-19T03:00:00.000Z",
  resolvedAt: null,
  resolvedBy: null,
  resolutionNote: null,
};

describe("PaymentIncidentPanel", () => {
  it("renders nothing when the order has no incidents", () => {
    const { container } = render(<PaymentIncidentPanel incidents={[]} onResolve={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows an alert with amount, transaction and follow-up guidance for an open incident", () => {
    render(<PaymentIncidentPanel incidents={[openIncident]} onResolve={vi.fn()} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Pembayaran diterima setelah pesanan dibatalkan");
    expect(alert).toHaveTextContent("tx-1");
    expect(alert).toHaveTextContent(/150\.000/);
    expect(alert).toHaveTextContent(/Refund lewat dashboard Midtrans/);
  });

  it("requires a note before resolving and passes it to onResolve", async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn().mockResolvedValue(true);
    render(<PaymentIncidentPanel incidents={[openIncident]} onResolve={onResolve} />);

    const button = screen.getByRole("button", { name: /tandai selesai/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/catatan tindak lanjut/i), "Refund penuh via Midtrans");
    expect(button).toBeEnabled();
    await user.click(button);

    await waitFor(() =>
      expect(onResolve).toHaveBeenCalledWith("inc1", "Refund penuh via Midtrans"),
    );
  });

  it("lists resolved incidents as history without an alert", () => {
    render(
      <PaymentIncidentPanel
        incidents={[
          {
            ...openIncident,
            resolvedAt: "2026-11-19T05:00:00.000Z",
            resolvedBy: "admin@zarilife.com",
            resolutionNote: "Refund penuh",
          },
        ]}
        onResolve={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Riwayat Insiden Pembayaran")).toBeInTheDocument();
    expect(screen.getByText("Refund penuh")).toBeInTheDocument();
    expect(screen.getByText(/admin@zarilife\.com/)).toBeInTheDocument();
  });
});
