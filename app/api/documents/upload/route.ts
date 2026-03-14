import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const patientId = formData.get("patientId");
  const documentType = formData.get("documentType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (typeof patientId !== "string" || patientId.length === 0) {
    return NextResponse.json({ error: "A patient ID is required." }, { status: 400 });
  }

  const bucket = documentType === "prescription" ? "prescriptions" : "patient-documents";
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const fileName = `${randomUUID()}${extension}`;
  const storagePath = `${patientId}/intake/${fileName}`;
  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  const { error: recordError } = await supabase.from("documents").insert({
    id: randomUUID(),
    patient_id: patientId,
    clinic_id: session.clinicId,
    file_url: publicUrlData.publicUrl,
    file_type: typeof documentType === "string" && documentType.length > 0 ? documentType : file.type || "document"
  });

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      patientId,
      documentType,
      fileName: file.name,
      storagePath,
      fileUrl: publicUrlData.publicUrl,
      provider: "supabase"
    }
  }, { status: 201 });
}
