import { ShoppingCart } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div>
      <PageHeader title="Orders" description="Your order history." />
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="Orders you place will appear here. Checkout arrives in the next phase."
      />
    </div>
  );
}
