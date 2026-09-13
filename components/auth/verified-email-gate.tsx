"use client";

import * as React from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFirebaseClient } from "@/lib/firebase/client";

export type EmailVerificationStatus =
  | "loading"
  | "unauthenticated"
  | "unverified"
  | "verified";

/**
 * Reactive email-verification status for the currently signed-in user.
 *
 * Verified email is required for sensitive operations such as purchasing
 * (Section 3). This hook is the client-side gate used to conditionally reveal
 * or block such actions; the authoritative check still happens server-side.
 */
export function useEmailVerification(): EmailVerificationStatus {
  const [status, setStatus] =
    React.useState<EmailVerificationStatus>("loading");

  React.useEffect(() => {
    const { auth } = getFirebaseClient();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setStatus("unauthenticated");
        return;
      }
      setStatus(user.emailVerified ? "verified" : "unverified");
    });
    return () => unsubscribe();
  }, []);

  return status;
}

/**
 * Renders its children only once the current user's email is verified.
 * While the auth state is resolving, `fallback` (or nothing) is shown; when the
 * user is signed in but unverified, a prompt to verify is displayed unless a
 * custom `unverified` node is provided.
 */
export function VerifiedEmailGate({
  children,
  fallback = null,
  unverified,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unverified?: React.ReactNode;
}) {
  const status = useEmailVerification();

  if (status === "loading") return <>{fallback}</>;
  if (status === "verified") return <>{children}</>;

  if (unverified !== undefined) return <>{unverified}</>;

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] border border-warning/40 bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] px-4 py-3">
      <MailWarning className="mt-0.5 size-5 shrink-0 text-warning" />
      <div className="text-sm">
        <p className="text-warning">
          Verify your email address to unlock this action.
        </p>
        <Button asChild variant="link" size="sm" className="h-auto px-0">
          <Link href="/verify-email">Verify your email</Link>
        </Button>
      </div>
    </div>
  );
}
