"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  confirmPasswordReset,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseClient } from "@/lib/firebase/client";
import { publicEnv } from "@/lib/env";
import { customerReference } from "@/lib/ids";

async function establishServerSession(user: User): Promise<void> {
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

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export async function registerWithEmail(input: RegisterInput): Promise<void> {
  const { auth, db } = getFirebaseClient();
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password,
  );

  await updateProfile(cred.user, { displayName: input.fullName });

  // Create the customer profile document (role is always "customer" here;
  // privileged roles are only granted server-side via custom claims).
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    customerReference: customerReference(),
    email: input.email,
    emailVerified: cred.user.emailVerified,
    fullName: input.fullName,
    role: "customer",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await sendEmailVerification(cred.user, {
    url: `${publicEnv.NEXT_PUBLIC_APP_URL}/login`,
  });

  await establishServerSession(cred.user);
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { auth } = getFirebaseClient();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await establishServerSession(cred.user);
}

export async function logout(): Promise<void> {
  const { auth } = getFirebaseClient();
  await signOut(auth);
  await fetch("/api/session", { method: "DELETE" });
}

export async function resendVerificationEmail(): Promise<void> {
  const { auth } = getFirebaseClient();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await sendEmailVerification(user, {
    url: `${publicEnv.NEXT_PUBLIC_APP_URL}/login`,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { auth } = getFirebaseClient();
  await sendPasswordResetEmail(auth, email, {
    url: `${publicEnv.NEXT_PUBLIC_APP_URL}/login`,
  });
}

export async function completePasswordReset(
  oobCode: string,
  newPassword: string,
): Promise<void> {
  const { auth } = getFirebaseClient();
  await confirmPasswordReset(auth, oobCode, newPassword);
}
