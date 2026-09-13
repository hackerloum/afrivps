"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  confirmPasswordReset,
  verifyPasswordResetCode,
  reload,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseClient } from "@/lib/firebase/client";
import { publicEnv } from "@/lib/env";
import { customerReference } from "@/lib/ids";

const VERIFY_CONTINUE_URL = `${publicEnv.NEXT_PUBLIC_APP_URL}/verify-email`;
const RESET_CONTINUE_URL = `${publicEnv.NEXT_PUBLIC_APP_URL}/login`;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Exchange a freshly-minted Firebase ID token for a secure server-side session
 * cookie. Kept provider-agnostic so email/password, Google and any future
 * sign-in method can reuse the exact same session-establishment path.
 */
export async function establishServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error("Failed to establish server session");
  }
}

/**
 * Create the customer profile document if it does not already exist.
 * The role is always "customer" here — privileged roles are only ever granted
 * server-side via custom claims (Sections 4, 42). Reused by every sign-in
 * method so Google auth can be added without duplicating profile bootstrap.
 */
async function ensureUserProfile(user: User, fullName?: string): Promise<void> {
  const { db } = getFirebaseClient();
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    // Keep the mirrored verification flag fresh without touching other fields.
    await setDoc(
      ref,
      { emailVerified: user.emailVerified, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return;
  }

  await setDoc(ref, {
    uid: user.uid,
    customerReference: customerReference(),
    email: user.email ?? "",
    emailVerified: user.emailVerified,
    fullName: fullName ?? user.displayName ?? "",
    role: "customer",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export async function registerWithEmail(input: RegisterInput): Promise<void> {
  const { auth, db } = getFirebaseClient();
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();

  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    input.password,
  );

  await updateProfile(cred.user, { displayName: fullName });

  // Create the customer profile document (role is always "customer" here;
  // privileged roles are only granted server-side via custom claims).
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    customerReference: customerReference(),
    email,
    emailVerified: cred.user.emailVerified,
    fullName,
    role: "customer",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await sendEmailVerification(cred.user, { url: VERIFY_CONTINUE_URL });

  await establishServerSession(cred.user);
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { auth } = getFirebaseClient();
  const cred = await signInWithEmailAndPassword(
    auth,
    normalizeEmail(email),
    password,
  );
  await establishServerSession(cred.user);
}

/**
 * Google sign-in seam (Section 3: "Design architecture so Google authentication
 * can be added later"). This reuses the shared profile bootstrap and session
 * path, so enabling Google is purely a matter of wiring a button + turning the
 * provider on in the Firebase console. No behaviour is faked.
 */
export async function loginWithGoogle(): Promise<void> {
  const { auth } = getFirebaseClient();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  await ensureUserProfile(cred.user);
  await establishServerSession(cred.user);
}

export async function logout(): Promise<void> {
  const { auth } = getFirebaseClient();
  try {
    await signOut(auth);
  } finally {
    // Always clear the server session cookie, even if client sign-out fails.
    await fetch("/api/session", { method: "DELETE" });
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const { auth } = getFirebaseClient();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await sendEmailVerification(user, { url: VERIFY_CONTINUE_URL });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { auth } = getFirebaseClient();
  await sendPasswordResetEmail(auth, normalizeEmail(email), {
    url: RESET_CONTINUE_URL,
  });
}

/**
 * Validate a password-reset out-of-band code before showing the reset form,
 * returning the associated email so the UI can confirm the account. Throws a
 * Firebase error (mapped by `authErrorMessage`) when the code is invalid or
 * expired.
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  const { auth } = getFirebaseClient();
  return verifyPasswordResetCode(auth, oobCode);
}

export async function completePasswordReset(
  oobCode: string,
  newPassword: string,
): Promise<void> {
  const { auth } = getFirebaseClient();
  await confirmPasswordReset(auth, oobCode, newPassword);
}

/**
 * Reload the current user and re-mint the server session cookie so that a
 * freshly verified email (or refreshed custom claims) is reflected in the
 * server session. Returns the current email-verified state.
 */
export async function refreshSession(): Promise<boolean> {
  const { auth } = getFirebaseClient();
  const user = auth.currentUser;
  if (!user) return false;
  await reload(user);
  await establishServerSession(user);
  return user.emailVerified;
}

/**
 * Thrown when a sensitive operation (e.g. purchasing) is attempted before the
 * account email has been verified (Section 3).
 */
export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Please verify your email address to continue.");
    this.name = "EmailNotVerifiedError";
  }
}

/** Synchronous, best-effort check of the current user's verified state. */
export function isEmailVerified(): boolean {
  const { auth } = getFirebaseClient();
  return auth.currentUser?.emailVerified ?? false;
}

/**
 * Client-side gate for sensitive operations. Reloads the user once to catch a
 * just-completed verification, then throws `EmailNotVerifiedError` if still
 * unverified. Server-side privileged routes MUST enforce this independently —
 * this is a UX guard, not the security boundary.
 */
export async function assertEmailVerified(): Promise<void> {
  const { auth } = getFirebaseClient();
  const user = auth.currentUser;
  if (!user) throw new EmailNotVerifiedError();
  if (user.emailVerified) return;
  await reload(user);
  if (!user.emailVerified) throw new EmailNotVerifiedError();
}
