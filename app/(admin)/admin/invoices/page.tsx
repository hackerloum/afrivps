import { FileText } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await requirePermission("invoices.read");
  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Invoices issued across all customers."
      />
      <EmptyState
        icon={FileText}
        title="No invoices yet"
        description="Invoices will appear here once checkout and billing go live (Phase 2)."
      />
    </div>
  );
}
