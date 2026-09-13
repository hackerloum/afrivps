import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  FileText,
  Receipt,
} from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { SectionHeading } from "../_components/dashboard-ui";

export const dynamic = "force-dynamic";

const BILLING_LINKS = [
  {
    href: "/dashboard/invoices",
    icon: FileText,
    title: "Invoices",
    description: "Review issued invoices and their payment status.",
  },
  {
    href: "/dashboard/payments",
    icon: Banknote,
    title: "Payments",
    description: "See your payment history and receipts.",
  },
] as const;

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices, payments and your billing profile."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {BILLING_LINKS.map((link) => (
          <Card key={link.href} className="flex flex-col p-6">
            <link.icon className="size-5 text-accent" />
            <h2 className="mt-3 font-medium text-foreground">{link.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              {link.description}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
              <Link href={link.href}>
                Open {link.title.toLowerCase()}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <SectionHeading icon={Building2} title="Billing profile" />
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No billing profile yet
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Your billing name, address and tax details will be captured at
                  checkout and appear on your invoices.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              Coming soon
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
