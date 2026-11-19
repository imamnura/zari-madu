import type { ICartItemView } from "@/types/shop";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface IOrderSummaryProps {
  items: ICartItemView[];
  shippingFee: number;
  shippingLabel?: string;
}

export function OrderSummary({ items, shippingFee, shippingLabel }: IOrderSummaryProps) {
  const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
  const total = subtotal + shippingFee;

  return (
    <aside
      data-testid="order-summary"
      className="sticky top-4 space-y-4 rounded-lg border bg-card p-4"
    >
      <h2 className="text-lg font-semibold">Ringkasan Pesanan</h2>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between gap-2">
            <span className="line-clamp-2">
              {it.productName}{" "}
              <span className="text-muted-foreground">× {it.quantity}</span>
            </span>
            <span className="shrink-0">{formatRupiah(it.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <hr />
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd data-testid="summary-subtotal">{formatRupiah(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Ongkos Kirim{shippingLabel ? ` (${shippingLabel})` : ""}</dt>
          <dd data-testid="summary-shipping">{formatRupiah(shippingFee)}</dd>
        </div>
      </dl>
      <hr />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span data-testid="summary-total">{formatRupiah(total)}</span>
      </div>
    </aside>
  );
}
