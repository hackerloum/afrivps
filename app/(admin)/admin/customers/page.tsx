import { Users } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requirePermission("customers.read");
  return (
    <div>
      <PageHeader title="Customers" description="Customer accounts and profiles." />
      <EmptyState
        icon={Users}
        title="Customer management coming soon"
        description="Customer directory and detail views arrive in a later phase."
      />
    </div>
  );
}
