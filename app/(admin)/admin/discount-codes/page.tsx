import { TicketPercent } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCodesPage() {
  await requirePermission("discounts.manage");
  return (
    <div>
      <PageHeader
        title="Discount Codes"
        description="Promotional codes applied at checkout. Validation always runs server-side."
      />
      <EmptyState
        icon={TicketPercent}
        title="No discount codes"
        description="Create and manage discount codes here once coupons are enabled (Phase 2)."
      />
    </div>
  );
}
