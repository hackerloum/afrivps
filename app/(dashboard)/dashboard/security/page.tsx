import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Lock, ShieldCheck, Smartphone } from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <PageHeader
        title="Security"
        description="Password, sign-in and account protection."
      />

      <Card className="mb-6 flex items-start gap-3 border-accent/30 bg-primary-muted/20 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Your session is protected
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You are signed in with a secure, server-verified session cookie.
            Sign out from the sidebar to end it on this device.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Password</h2>
          </div>
          <p className="mt-4 flex-1 text-sm text-muted-foreground">
            Change your password at any time using the secure reset flow. We will
            email a reset link to{" "}
            <span className="text-foreground">{session.email}</span>.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </Card>

        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">
                Two-factor authentication
              </h2>
            </div>
            <Badge variant="outline" className="shrink-0">
              Coming soon
            </Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Add an extra layer of protection with an authenticator app. This
            option will become available in a later phase.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">
                Active sessions
              </h2>
            </div>
            <Badge variant="outline" className="shrink-0">
              Coming soon
            </Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            A list of devices where you are signed in, with the ability to revoke
            individual sessions, will appear here in a later phase.
          </p>
        </Card>
      </div>
    </div>
  );
}
