"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OrderStatusValue } from "@/types/shop";

const LEGAL: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

interface IOrderStatusStepperProps {
  currentStatus: OrderStatusValue;
  onTransition: (
    target: OrderStatusValue,
    payload: { trackingNumber?: string; courier?: string; cancelReason?: string },
  ) => void | Promise<void>;
}

const ALL_STATUSES: OrderStatusValue[] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

export function OrderStatusStepper({
  currentStatus,
  onTransition,
}: IOrderStatusStepperProps) {
  const [target, setTarget] = useState<OrderStatusValue | null>(null);
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const legalNext = LEGAL[currentStatus];

  const triggerTransition = (t: OrderStatusValue) => {
    setTarget(t);
    setTracking("");
    setCourier("");
    setReason("");
  };

  const close = () => {
    if (!submitting) setTarget(null);
  };

  const submit = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await onTransition(target, {
        trackingNumber: target === "SHIPPED" ? tracking : undefined,
        courier: target === "SHIPPED" ? courier : undefined,
        cancelReason: target === "CANCELLED" ? reason : undefined,
      });
      setTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    target === "SHIPPED"
      ? tracking.trim().length > 0 && courier.trim().length > 0
      : target === "CANCELLED"
        ? reason.trim().length > 0
        : Boolean(target);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2" data-testid="status-flow">
        {ALL_STATUSES.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`rounded-md px-3 py-1 text-sm ${
                s === currentStatus
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {STATUS_LABEL[s]}
            </span>
            {idx < ALL_STATUSES.length - 1 ? <span>→</span> : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.concat("CANCELLED").map((s) => {
          const disabled = !legalNext.includes(s);
          return (
            <Button
              key={s}
              size="sm"
              variant={s === "CANCELLED" ? "destructive" : "default"}
              disabled={disabled}
              onClick={() => triggerTransition(s)}
              data-testid={`transition-${s}`}
            >
              {STATUS_LABEL[s]}
            </Button>
          );
        })}
      </div>

      <Dialog open={target !== null} onOpenChange={(open) => (!open ? close() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {target ? `Ubah ke ${STATUS_LABEL[target]}?` : ""}
            </DialogTitle>
            <DialogDescription>
              {target === "SHIPPED"
                ? "Masukkan nomor resi dan nama kurir."
                : target === "CANCELLED"
                  ? "Tuliskan alasan pembatalan."
                  : "Konfirmasi perubahan status."}
            </DialogDescription>
          </DialogHeader>
          {target === "SHIPPED" ? (
            <div className="space-y-2">
              <Input
                placeholder="Nomor Resi"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                aria-label="Nomor Resi"
              />
              <Input
                placeholder="Kurir (JNE, J&T, ...)"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                aria-label="Kurir"
              />
            </div>
          ) : target === "CANCELLED" ? (
            <Input
              placeholder="Alasan pembatalan"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-label="Alasan"
            />
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={submit} disabled={!canSubmit || submitting}>
              {submitting ? "Memproses..." : "Ubah Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
