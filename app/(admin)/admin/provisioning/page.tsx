import { Wrench } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminProvisioningPage() {
  await requirePermission("provisioning.manage");
  return (
    <div>
      <PageHeader
        title="Provisioning"
        description="Manual provisioning queue and provisioning jobs."
      />
      <EmptyState
        icon={Wrench}
        title="No provisioning jobs"
        description="Manual provisioning workflow arrives in Phase 3."
      />
    </div>
  );
}
