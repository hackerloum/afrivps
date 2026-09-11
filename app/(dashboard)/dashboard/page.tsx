import Link from "next/link";
import {
  Activity,
  CalendarClock,
  FileText,
  LifeBuoy,
  Server,
  ShieldAlert,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";

import { SectionHeading, StatLink } from "./_components/dashboard-ui";

export const dynamic = "force-dynamic";

// Section 19 summary widgets. Phase 1 is a shell with no customer order/billing
// data source wired yet, so every widget renders its real empty state — no
// fabricated counts or activity (Sections 28, 79).
const STATS = [
  {
    href: "/dashboard/services",
    label: "Active services",
    icon: Server,
    hint: "No active services yet",
  },
  {
    href: "/dashboard/orders",
    label: "Pending services",
    icon: ShoppingCart,
    hint: "Nothing awaiting setup",
  },
  {
    href: "/dashboard/invoices",
    label: "Outstanding invoices",
    icon: FileText,
    hint: "Nothing due",
  },
  {
    href: "/dashboard/support",
    label: "Open tickets",
    icon: LifeBuoy,
    hint: "No open tickets",
  },
] as const;

const QUICK_ACTIONS = [
  {
    href: "/pricing",
    icon: Server,
    title: "Deploy a server",
    description: "Browse plans and launch a new VPS.",
    cta: "View plans",
  },
  {
    href: "/dashboard/support",
    icon: LifeBuoy,
    title: "Get support",
    description: "Open a ticket with our team.",
    cta: "Support",
  },
  {
    href: "/dashboard/invoices",
    icon: FileText,
    title: "View invoices",
    description: "Review your billing history.",
    cta: "Invoices",
  },
] as const;

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const displayName = session?.email?.split("@")[0] ?? "there";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
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
        <Card className="mb-6 flex flex-col gap-3 border-warning/40 bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">
                Verify your email to enable purchasing
              </p>
              <p className="text-sm text-warning/80">
                A verified email is required before you can deploy paid services.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/verify-email">Verify now</Link>
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatLink
            key={stat.href}
            href={stat.href}
            label={stat.label}
            value={0}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading icon={Activity} title="Recent activity" />
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="When you deploy services and make payments, your recent activity will show here."
          />
        </div>
        <div>
          <SectionHeading icon={CalendarClock} title="Upcoming renewals" />
          <EmptyState
            icon={CalendarClock}
            title="Nothing due"
            description="Renewal dates for your services will appear here."
          />
        </div>
      </div>

      <div className="mt-6">
        <SectionHeading title="Quick actions" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Card key={action.href} className="flex flex-col p-5">
              <action.icon className="size-5 text-accent" />
              <h3 className="mt-3 font-medium text-foreground">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {action.description}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
                <Link href={action.href}>{action.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
