import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api/guards";
import { resolvePaymentIncident } from "@/lib/payment-incidents";
import { resolvePaymentIncidentSchema } from "@/lib/schemas/shop";

/** Tandai insiden pembayaran selesai ditindaklanjuti (wajib catatan). */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; incidentId: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = resolvePaymentIncidentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const { id, incidentId } = await context.params;
    const resolved = await resolvePaymentIncident(id, incidentId, {
      note: parsed.data.note,
      resolvedBy: session.user?.email ?? "admin",
    });
    if (!resolved) {
      return NextResponse.json(
        { success: false, error: "Insiden tidak ditemukan atau sudah ditandai selesai" },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true, data: { id: incidentId } });
  } catch (error) {
    console.error("[/api/admin/orders/[id]/incidents/[incidentId] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui insiden" },
      { status: 500 },
    );
  }
}
