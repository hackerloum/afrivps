import Link from "next/link";
import {
  Activity,
  CalendarClock,
  FileText,
  LifeBuoy,
  Server,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { StatCard } from "@/components/shell/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await getSession();

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your services, billing and support at a glance."
        action={
          <Button asChild>
            <Link href="/pricing">
              <Zap className="size-4" /> Deploy a server
            </Link>
          </Button>
        }
      />

      {session && !session.emailVerified && (
        <Card className="mb-6 border-warning/40 bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] p-4">
          <p className="text-sm text-warning">
            Your email is not verified yet. Verify your email to enable
            purchasing.{" "}
            <Link href="/verify-email" className="font-medium underline">
              Verify now
            </Link>
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active services" value={0} icon={Server} />
        <StatCard label="Pending services" value={0} icon={ShoppingCart} />
        <StatCard label="Outstanding invoices" value={0} icon={FileText} />
        <StatCard label="Open tickets" value={0} icon={LifeBuoy} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="size-4 text-accent" /> Recent activity
          </h2>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="When you deploy services and make payments, your recent activity will show here."
          />
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarClock className="size-4 text-accent" /> Upcoming renewals
          </h2>
          <EmptyState
            icon={CalendarClock}
            title="Nothing due"
            description="Renewal dates for your services will appear here."
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <Server className="size-5 text-accent" />
            <h3 className="mt-3 font-medium text-foreground">Deploy a server</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse plans and launch a new VPS.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/pricing">View plans</Link>
            </Button>
          </Card>
          <Card className="p-5">
            <LifeBuoy className="size-5 text-accent" />
            <h3 className="mt-3 font-medium text-foreground">Get support</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a ticket with our team.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dashboard/support">Support</Link>
            </Button>
          </Card>
          <Card className="p-5">
            <FileText className="size-5 text-accent" />
            <h3 className="mt-3 font-medium text-foreground">View invoices</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your billing history.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dashboard/billing">Billing</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
