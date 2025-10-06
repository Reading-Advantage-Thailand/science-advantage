import { NextResponse } from "next/server";

import {
  buildDevAuthCookiePayload,
  clearDevAuthCookie,
  getDevAuthCookie,
  setDevAuthCookie,
} from "@/lib/dev-auth.server";
import { DEV_AUTH_COOKIE, isAllowedDevRole, isDevAuthEnabled } from "@/lib/dev-auth";

export async function POST(request: Request) {
  if (!isDevAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const roleInput =
    typeof (body as Record<string, unknown>).role === "string"
      ? ((body as Record<string, unknown>).role as string)
      : "";

  if (!isAllowedDevRole(roleInput)) {
    return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
  }

  const payload = buildDevAuthCookiePayload({
    role: roleInput,
    name:
      typeof (body as Record<string, unknown>).name === "string"
        ? ((body as Record<string, unknown>).name as string)
        : undefined,
    email:
      typeof (body as Record<string, unknown>).email === "string"
        ? ((body as Record<string, unknown>).email as string)
        : undefined,
  });

  await setDevAuthCookie(payload);

  return NextResponse.json({
    session: {
      role: payload.role,
      name: payload.name,
      email: payload.email,
      id: payload.id,
    },
    cookie: DEV_AUTH_COOKIE,
  });
}

export async function DELETE() {
  if (!isDevAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await clearDevAuthCookie();

  return NextResponse.json({ success: true });
}

export async function GET() {
  if (!isDevAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = await getDevAuthCookie();

  if (!current) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: {
      role: current.role,
      name: current.name,
      email: current.email,
      id: current.id,
    },
  });
}
