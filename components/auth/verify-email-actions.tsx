"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { FormAlert, FormSuccess } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/errors";

export function VerifyEmailActions() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  async function resend() {
    setError(null);
    setStatus("loading");
    try {
      await resendVerificationEmail();
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(authErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <FormAlert message={error} />
      {status === "sent" && (
        <FormSuccess message="Verification email sent. Check your inbox (or the Auth emulator UI in development)." />
      )}
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
      <Button asChild className="w-full">
        <Link href="/dashboard">Continue to dashboard</Link>
      </Button>
    </div>
  );
}
