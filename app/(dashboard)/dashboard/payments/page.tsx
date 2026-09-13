import { Banknote } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";

export const dynamic = "force-dynamic";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Payments"
        description="Your payment history and receipts."
      />
      <EmptyState
        icon={Banknote}
        title="No payments yet"
        description="Payments you make against invoices will appear here with their receipts. Manual payments arrive in the next phase."
      />
    </div>
  );
}
