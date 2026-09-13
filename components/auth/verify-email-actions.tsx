"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { FormAlert, FormSuccess } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { refreshSession, resendVerificationEmail } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/errors";

export function VerifyEmailActions() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent">(
    "idle",
  );
  const [checking, setChecking] = React.useState(false);
  const [notVerified, setNotVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function resend() {
    setError(null);
    setNotVerified(false);
    setStatus("loading");
    try {
      await resendVerificationEmail();
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(authErrorMessage(err));
    }
  }

  async function checkVerification() {
    setError(null);
    setNotVerified(false);
    setChecking(true);
    try {
      // Reload the user and re-mint the session so the verified flag propagates
      // to the server session cookie used for gating (Section 3).
      const verified = await refreshSession();
      if (verified) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setNotVerified(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-4">
      <FormAlert message={error} />
      {status === "sent" && (
        <FormSuccess message="Verification email sent. Check your inbox (or the Auth emulator UI in development)." />
      )}
      {notVerified && (
        <FormAlert message="We couldn't confirm your email yet. Click the link in the email, then check again." />
      )}

      <Button
        type="button"
        onClick={checkVerification}
        className="w-full"
        disabled={checking}
      >
        {checking && <Loader2 className="size-4 animate-spin" />}
        I&apos;ve verified my email
      </Button>

      <Button
        type="button"
        onClick={resend}
        className="w-full"
        variant="secondary"
        disabled={status === "loading"}
      >
        {status === "loading" && <Loader2 className="size-4 animate-spin" />}
        Resend verification email
      </Button>

      <Button asChild variant="ghost" className="w-full">
        <Link href="/dashboard">Continue to dashboard</Link>
      </Button>
    </div>
  );
}
