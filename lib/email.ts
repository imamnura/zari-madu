import { Resend } from "resend";
import type { IOrderView } from "@/types/shop";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "Zari Honey <noreply@zarilife.com>";
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildAddressBlock(order: IOrderView): string {
  const rtRw = order.rtRw ? `RT/RW ${order.rtRw}` : "";
  return [
    `<strong>${order.recipientName}</strong>`,
    order.addressLine,
    rtRw,
    `${order.kelurahan}, ${order.kecamatan}`,
    `${order.city}, ${order.province} ${order.postalCode}`,
  ]
    .filter(Boolean)
    .join("<br/>");
}

function buildItemRows(order: IOrderView): string {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatRupiah(item.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatRupiah(item.subtotal)}</td>
        </tr>`,
    )
    .join("");
}

function whatsappFallbackLink(orderNumber: string): string {
  const phone = process.env.WHATSAPP_ADMIN_PHONE?.replace(/\D/g, "") || "6285777578827";
  const text = encodeURIComponent(
    `Halo Admin Zari Honey, saya ingin menanyakan pesanan ${orderNumber}.`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export async function sendOrderConfirmationEmail(
  order: IOrderView,
  recipientEmail: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping confirmation email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: recipientEmail,
      subject: `Pesanan ${order.orderNumber} telah dibayar — Zari Honey`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
          <h1 style="color:#a06f12;">Terima kasih atas pesanan Anda!</h1>
          <p>Pesanan <strong>${order.orderNumber}</strong> telah kami terima.</p>
          <h3>Detail Pesanan</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f7f3eb;">
                <th style="padding:8px;text-align:left;">Produk</th>
                <th style="padding:8px;">Qty</th>
                <th style="padding:8px;text-align:right;">Harga</th>
                <th style="padding:8px;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${buildItemRows(order)}</tbody>
            <tfoot>
              <tr><td colspan="3" style="padding:8px;text-align:right;">Subtotal</td><td style="padding:8px;text-align:right;">${formatRupiah(order.subtotal)}</td></tr>
              <tr><td colspan="3" style="padding:8px;text-align:right;">Ongkos Kirim</td><td style="padding:8px;text-align:right;">${formatRupiah(order.shippingFee)}</td></tr>
              <tr><td colspan="3" style="padding:8px;text-align:right;font-weight:bold;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;">${formatRupiah(order.total)}</td></tr>
            </tfoot>
          </table>
          <h3>Alamat Pengiriman</h3>
          <p>${buildAddressBlock(order)}</p>
          <p style="margin-top:24px;">Butuh bantuan? <a href="${whatsappFallbackLink(order.orderNumber)}">Hubungi Admin via WhatsApp</a>.</p>
        </div>`,
    });
  } catch (error) {
    console.error("[email] Failed to send order confirmation:", error);
  }
}

export async function sendOrderShippedEmail(
  order: IOrderView,
  recipientEmail: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping shipped email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: recipientEmail,
      subject: `Pesanan ${order.orderNumber} sedang dikirim — Zari Honey`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
          <h1 style="color:#a06f12;">Pesanan Anda sedang dikirim!</h1>
          <p>Pesanan <strong>${order.orderNumber}</strong> sudah dalam perjalanan.</p>
          <p><strong>Kurir:</strong> ${order.courier ?? "-"}<br/>
             <strong>Nomor Resi:</strong> ${order.trackingNumber ?? "-"}</p>
          <h3>Alamat Pengiriman</h3>
          <p>${buildAddressBlock(order)}</p>
          <p style="margin-top:24px;"><a href="${whatsappFallbackLink(order.orderNumber)}">Hubungi Admin via WhatsApp</a></p>
        </div>`,
    });
  } catch (error) {
    console.error("[email] Failed to send shipped email:", error);
  }
}
