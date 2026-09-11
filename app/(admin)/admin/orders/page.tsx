import { ShoppingCart } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="Orders" description="All customer orders." />
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="Orders will appear here as customers check out (Phase 2)."
      />
    </div>
  );
}
