import { LifeBuoy } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requirePermission("support.read");
  return (
    <div>
      <PageHeader title="Support" description="Customer support tickets." />
      <EmptyState
        icon={LifeBuoy}
        title="No tickets yet"
        description="Support tickets from customers will appear here (Phase 4)."
      />
    </div>
  );
}
