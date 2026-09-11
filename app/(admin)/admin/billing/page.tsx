import { CreditCard } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  await requirePermission("invoices.read");
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices and payments across all customers."
      />
      <EmptyState
        icon={CreditCard}
        title="No billing records"
        description="Invoices and payments will appear here (Phase 2)."
      />
    </div>
  );
}
