import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession, clearSession } from "@/lib/session";

// The Firebase Admin SDK requires the Node.js runtime (not Edge), and session
// responses must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  // A Firebase ID token is a JWT: three base64url segments separated by dots.
  idToken: z
    .string()
    .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, "Malformed token"),
});

/**
 * Exchange a Firebase ID token for a secure server-side session cookie.
 * The token is verified by the Admin SDK inside `createSession`.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await createSession(parsed.data.idToken);
    return NextResponse.json({ ok: true });
  } catch {
    // Never leak internal error details to the client (Section 58).
    return NextResponse.json(
      { error: "Could not create session" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
