import { Wallet } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // Payments are restricted to finance / super_admin by the permission layer.
  await requirePermission("payments.read");
  return (
    <div>
      <PageHeader
        title="Payments"
        description="Confirmed and pending payments. Confirmation always happens server-side."
      />
      <EmptyState
        icon={Wallet}
        title="No payments yet"
        description="Payments will appear here once billing goes live (Phase 2)."
      />
    </div>
  );
}
