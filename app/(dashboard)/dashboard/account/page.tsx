import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <PageHeader
        title="Account"
        description="Your profile and security details."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{session.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email verified</dt>
              <dd>
                {session.emailVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Unverified</Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Account type</dt>
              <dd className="capitalize text-foreground">{session.role}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Security</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Your account is protected by a secure server-side session. Editing
            profile details and managing security settings arrives in a later
            phase.
          </p>
        </Card>
      </div>
    </div>
  );
}
