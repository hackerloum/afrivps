import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailActions } from "@/components/auth/verify-email-actions";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      description="We've sent a verification link to your email. Verify your address to unlock purchasing and sensitive actions."
    >
      <div className="mb-5 flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
        <MailCheck className="size-5 text-accent" />
        <p className="text-sm text-muted-foreground">
          Email verification is required before purchasing services.
        </p>
      </div>
      <VerifyEmailActions />
    </AuthCard>
  );
}
