import Link from "next/link";
import { FileText } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function InvoicesPage() {
  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Invoices issued for your services and renewals."
      />
      <EmptyState
        icon={FileText}
        title="No invoices yet"
        description="Invoices are generated when you place an order or a service is due for renewal. Checkout arrives in the next phase."
        action={
          <Button asChild variant="outline">
            <Link href="/pricing">Browse plans</Link>
          </Button>
        }
      />
    </div>
  );
}
