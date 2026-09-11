import { Server } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requirePermission("services.read");
  return (
    <div>
      <PageHeader title="Services" description="All provisioned services." />
      <EmptyState
        icon={Server}
        title="No services yet"
        description="Active VPS instances will appear here once provisioned (Phase 3)."
      />
    </div>
  );
}
