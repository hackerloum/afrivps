import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const accountType = session.role === "customer" ? "Customer" : "Staff";

  return (
    <div>
      <PageHeader
        title="Account"
        description="Your profile and contact details."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground">{session.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Email verified</dt>
              <dd>
                {session.emailVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Unverified</Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Account type</dt>
              <dd className="text-foreground">{accountType}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-muted-foreground">
            Editing your name, phone, company and billing address arrives in a
            later phase.
          </p>
        </Card>

        <Card className="flex flex-col p-6">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Email verification
            </h2>
          </div>
          {session.emailVerified ? (
            <p className="mt-4 flex-1 text-sm text-muted-foreground">
              Your email address is verified. You can deploy paid services and
              receive important account notifications.
            </p>
          ) : (
            <>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">
                Your email address is not verified yet. Verify it to enable
                purchasing and secure your account.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
                <Link href="/verify-email">Verify email</Link>
              </Button>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Looking for security settings?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your password and active session from the Security page.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/security">Open security</Link>
        </Button>
      </Card>
    </div>
  );
}
