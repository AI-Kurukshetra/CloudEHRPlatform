import { NextResponse } from "next/server";

export function wantsJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";

  return contentType.includes("application/json") || accept.includes("application/json");
}

export async function readRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return { data: await request.json(), kind: "json" as const };
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    return { data, kind: "form" as const };
  }

  return { data: {}, kind: "empty" as const };
}

export function redirectOrJson(request: Request, redirectTo: string, body: unknown, status = 200) {
  if (wantsJson(request)) {
    return NextResponse.json(body, { status });
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}

export function validationError(request: Request, message: string, details?: unknown) {
  if (wantsJson(request)) {
    return NextResponse.json({ error: message, details }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/dashboard?denied=1`, request.url), { status: 303 });
}
