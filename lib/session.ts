import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

import { adminAuth } from "@/lib/firebase/admin";
import { serverEnv, useEmulators } from "@/lib/env";
import type { UserRole } from "@/types";
import { assertCan, isStaffRole, type Permission } from "@/lib/firebase/permissions";

export const SESSION_COOKIE_NAME = "afrivps_session";

export interface SessionUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: UserRole;
}

function roleFromClaims(claims: DecodedIdToken): UserRole {
  const raw = typeof claims.role === "string" ? claims.role : "customer";
  return (raw as UserRole) ?? "customer";
}

/**
 * Exchange a freshly-minted Firebase ID token for a secure, HttpOnly session
 * cookie and persist it. Called from the server after client sign-in.
 */
export async function createSession(idToken: string): Promise<void> {
  const env = serverEnv();
  const expiresInMs = env.SESSION_COOKIE_DAYS * 24 * 60 * 60 * 1000;

  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: expiresInMs,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: !useEmulators && process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(expiresInMs / 1000),
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verify the session cookie and return the authenticated user, or null.
 * `checkRevoked` guards against tokens revoked after sign-out.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified ?? false,
      role: roleFromClaims(decoded),
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError("Not authenticated");
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isStaffRole(user.role)) throw new AuthError("Staff access required");
  return user;
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireUser();
  assertCan(user.role, permission);
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
