import { createHash } from "node:crypto";
import type {
  IMidtransNotification,
  ISnapTransactionResponse,
} from "@/types/shop";

function isProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function snapBaseUrl(): string {
  return isProduction()
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1";
}

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!key) {
    throw new Error("MIDTRANS_SERVER_KEY tidak diatur");
  }
  return key;
}

function basicAuthHeader(serverKey: string): string {
  const encoded = Buffer.from(`${serverKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export interface ICreateSnapInput {
  orderId: string;
  grossAmount: number;
  customer: {
    firstName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shipping?: {
    fee: number;
    label?: string;
  };
  callbacks?: {
    finish?: string;
  };
}

export async function createSnapTransaction(
  input: ICreateSnapInput,
): Promise<ISnapTransactionResponse> {
  const serverKey = getServerKey();
  const url = `${snapBaseUrl()}/transactions`;

  const itemDetails: ICreateSnapInput["items"] = [...input.items];
  if (input.shipping && input.shipping.fee > 0) {
    itemDetails.push({
      id: "SHIPPING",
      name: input.shipping.label ?? "Ongkos Kirim",
      price: input.shipping.fee,
      quantity: 1,
    });
  }

  const sum = itemDetails.reduce((acc, it) => acc + it.price * it.quantity, 0);
  if (sum !== input.grossAmount) {
    throw new Error(
      `Total item_details (${sum}) tidak sama dengan grossAmount (${input.grossAmount})`,
    );
  }

  const body = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    customer_details: {
      first_name: input.customer.firstName,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    item_details: itemDetails,
    callbacks: input.callbacks,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: basicAuthHeader(serverKey),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json()) as Partial<ISnapTransactionResponse> & {
    error_messages?: string[];
  };

  if (!res.ok || !json.token) {
    const message = json.error_messages?.join("; ") ?? `Midtrans error ${res.status}`;
    throw new Error(message);
  }

  return {
    token: json.token,
    redirect_url: json.redirect_url ?? "",
  };
}

export function verifyNotificationSignature(
  notification: Pick<
    IMidtransNotification,
    "order_id" | "status_code" | "gross_amount" | "signature_key"
  >,
): boolean {
  const serverKey = getServerKey();
  const payload =
    notification.order_id +
    notification.status_code +
    notification.gross_amount +
    serverKey;
  const expected = createHash("sha512").update(payload).digest("hex");
  return expected === notification.signature_key;
}

export type MidtransTerminalStatus =
  | "settlement"
  | "capture"
  | "expire"
  | "cancel"
  | "deny"
  | "failure"
  | "refund"
  | "partial_refund"
  | "pending";

export function mapTransactionStatusToOrder(
  transactionStatus: string,
  fraudStatus?: string,
): "PAID" | "CANCELLED" | "PENDING" {
  if (transactionStatus === "settlement") return "PAID";
  if (transactionStatus === "capture") {
    return fraudStatus === "accept" ? "PAID" : "PENDING";
  }
  if (
    transactionStatus === "expire" ||
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "failure"
  ) {
    return "CANCELLED";
  }
  return "PENDING";
}

export function mapTransactionStatusToPayment(
  transactionStatus: string,
): "PENDING" | "SETTLEMENT" | "EXPIRE" | "CANCEL" | "DENY" | "FAILURE" {
  switch (transactionStatus) {
    case "settlement":
    case "capture":
      return "SETTLEMENT";
    case "expire":
      return "EXPIRE";
    case "cancel":
      return "CANCEL";
    case "deny":
      return "DENY";
    case "failure":
      return "FAILURE";
    default:
      return "PENDING";
  }
}
