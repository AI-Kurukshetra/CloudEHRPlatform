import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { billingClaimSchema, billingFiltersSchema, paymentSchema } from "@/lib/schemas";
import { createClaimPayment, createBillingClaimFromEncounter, deleteBillingClaimRecord, deleteClaimPayment, getBillingClaimDetail, listBillingClaimsWithDetails, updateBillingClaimRecord } from "@/lib/billing-repositories";
import { logAuditAction } from "@/lib/repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  if (searchParams.id) {
    const data = await getBillingClaimDetail(searchParams.id, session.clinicId);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  }

  const parsed = billingFiltersSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = await listBillingClaimsWithDetails(session.clinicId, parsed.data);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  if (payload.kind === "payment") {
    const parsedPayment = paymentSchema.safeParse(payload);
    if (!parsedPayment.success) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    const data = await createClaimPayment(parsedPayment.data);
    await logAuditAction(session.id, `Recorded payment for claim ${parsedPayment.data.claimId}`);
    return NextResponse.json({ data }, { status: 201 });
  }

  const parsed = billingClaimSchema.safeParse({ ...payload, clinicId: session.clinicId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid billing payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = await createBillingClaimFromEncounter(parsed.data);
  if (data) {
    await logAuditAction(session.id, `Generated billing claim ${data.claim.id}`);
  }
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const claimId = typeof payload.id === "string" ? payload.id : "";
  const parsed = billingClaimSchema.safeParse({ ...payload, clinicId: session.clinicId });
  if (!claimId || !parsed.success) {
    return NextResponse.json({ error: "Invalid billing payload" }, { status: 400 });
  }

  const data = await updateBillingClaimRecord(claimId, session.clinicId, { ...parsed.data, claimNumber: parsed.data.claimNumber ?? `CLM-${claimId.slice(0, 8).toUpperCase()}` });
  if (data) {
    await logAuditAction(session.id, `Updated billing claim ${data.claim.id}`);
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const claimId = url.searchParams.get("id");
  const paymentId = url.searchParams.get("paymentId");

  if (paymentId) {
    await deleteClaimPayment(paymentId);
    await logAuditAction(session.id, `Deleted billing payment ${paymentId}`);
    return NextResponse.json({ ok: true });
  }

  if (!claimId) {
    return NextResponse.json({ error: "Claim id is required" }, { status: 400 });
  }

  await deleteBillingClaimRecord(claimId, session.clinicId);
  await logAuditAction(session.id, `Deleted billing claim ${claimId}`);
  return NextResponse.json({ ok: true });
}