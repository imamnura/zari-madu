"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface IPaymentIncidentView {
  id: string;
  type: "PAID_AFTER_CANCEL";
  transactionId: string;
  grossAmount: number | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
}

const TYPE_LABEL: Record<IPaymentIncidentView["type"], { title: string; action: string }> = {
  PAID_AFTER_CANCEL: {
    title: "Pembayaran diterima setelah pesanan dibatalkan",
    action:
      "Dana sudah masuk tetapi pesanan berstatus batal dan stoknya sudah dikembalikan. " +
      "Refund lewat dashboard Midtrans atau hubungi pelanggan untuk memproses ulang pesanan, " +
      "lalu tandai selesai beserta catatan tindakannya.",
  },
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}

interface IPaymentIncidentPanelProps {
  incidents: IPaymentIncidentView[];
  /** @returns true bila berhasil; panel menampilkan error dari pemanggil (toast). */
  onResolve: (incidentId: string, note: string) => Promise<boolean>;
}

export function PaymentIncidentPanel({ incidents, onResolve }: IPaymentIncidentPanelProps) {
  if (incidents.length === 0) return null;
  const open = incidents.filter((i) => !i.resolvedAt);
  const resolved = incidents.filter((i) => i.resolvedAt);

  return (
    <section className="space-y-3" aria-label="Insiden pembayaran">
      {open.map((incident) => (
        <OpenIncident key={incident.id} incident={incident} onResolve={onResolve} />
      ))}
      {resolved.length > 0 ? (
        <div className="rounded-lg border p-3 text-sm">
          <h2 className="mb-2 font-semibold">Riwayat Insiden Pembayaran</h2>
          <ul className="space-y-2">
            {resolved.map((incident) => (
              <li key={incident.id} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <div>
                  <p>
                    {TYPE_LABEL[incident.type].title} — selesai {formatDate(incident.resolvedAt!)} oleh{" "}
                    {incident.resolvedBy ?? "admin"}
                  </p>
                  <p className="text-muted-foreground">{incident.resolutionNote}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function OpenIncident({
  incident,
  onResolve,
}: {
  incident: IPaymentIncidentView;
  onResolve: IPaymentIncidentPanelProps["onResolve"];
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const label = TYPE_LABEL[incident.type];
  const noteId = `incident-note-${incident.id}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (await onResolve(incident.id, note.trim())) setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="alert" className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="space-y-1">
          <h2 className="font-semibold text-red-800">{label.title}</h2>
          <p>
            Nominal: {incident.grossAmount !== null ? formatRupiah(incident.grossAmount) : "—"} ·
            Transaksi: <span className="font-mono">{incident.transactionId}</span> ·{" "}
            {formatDate(incident.createdAt)}
          </p>
          <p className="text-red-900/80">{label.action}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <label htmlFor={noteId} className="font-medium">
          Catatan tindak lanjut
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="w-full rounded-md border bg-white p-2"
          placeholder="Mis. refund penuh via dashboard Midtrans 19/11, pelanggan sudah dihubungi"
        />
        <Button type="submit" size="sm" disabled={submitting || note.trim().length < 5}>
          {submitting ? "Menyimpan..." : "Tandai selesai"}
        </Button>
      </form>
    </div>
  );
}
