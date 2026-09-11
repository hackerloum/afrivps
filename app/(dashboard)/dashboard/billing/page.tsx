import { FileText } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices, payments and billing profile."
      />
      <EmptyState
        icon={FileText}
        title="No invoices yet"
        description="Your invoices and payment history will appear here once you have services."
      />
    </div>
  );
}
