import { NextResponse } from "next/server";
import { z } from "zod";

import { createSession, clearSession } from "@/lib/session";

const bodySchema = z.object({
  idToken: z.string().min(10),
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
