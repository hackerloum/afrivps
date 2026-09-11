import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";

import { adminAuth } from "@/lib/firebase/admin";
import { serverEnv, useEmulators } from "@/lib/env";
import type { UserRole } from "@/types";
import {
  assertCan,
  can,
  isStaffRole,
  type Permission,
} from "@/lib/firebase/permissions";

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

/** Non-throwing check for the current session's permission. */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getSession();
  return can(user?.role, permission);
}

/** The current session's staff user, or `null` when absent / not staff. */
export async function getStaffSession(): Promise<SessionUser | null> {
  const user = await getSession();
  return user && isStaffRole(user.role) ? user : null;
}

/**
 * Redirect targets for the ergonomic layout guards below. Both default to the
 * behavior the existing dashboard/admin layouts already implement, so guards
 * can be adopted without changing UX.
 */
export interface GuardRedirects {
  /** Where unauthenticated visitors are sent. Default: `/login`. */
  loginPath?: string;
  /** Where authenticated-but-unauthorized users are sent. Default: `/dashboard`. */
  forbiddenPath?: string;
}

/**
 * Ergonomic guard for protected layouts: returns the session or performs a
 * server-side `redirect` to the login page. Never returns for anonymous users.
 */
export async function requireUserOrRedirect(
  redirects: GuardRedirects = {},
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(redirects.loginPath ?? "/login");
  return user;
}

/**
 * Ergonomic guard for staff-only layouts (e.g. `/admin`). Redirects anonymous
 * users to login and non-staff users to the customer dashboard.
 */
export async function requireStaffOrRedirect(
  redirects: GuardRedirects = {},
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(redirects.loginPath ?? "/login");
  if (!isStaffRole(user.role)) redirect(redirects.forbiddenPath ?? "/dashboard");
  return user;
}

/**
 * Ergonomic guard for permission-gated layouts/pages. Redirects anonymous users
 * to login and users lacking `permission` to a safe fallback route.
 */
export async function requirePermissionOrRedirect(
  permission: Permission,
  redirects: GuardRedirects = {},
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(redirects.loginPath ?? "/login");
  if (!can(user.role, permission)) {
    redirect(redirects.forbiddenPath ?? "/dashboard");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
