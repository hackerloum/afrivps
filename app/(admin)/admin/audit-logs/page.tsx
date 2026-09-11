import { ScrollText } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requirePermission("audit.read");
  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of administrative actions."
      />
      <EmptyState
        icon={ScrollText}
        title="No audit entries"
        description="Sensitive administrative actions will be recorded here (Phase 4)."
      />
    </div>
  );
}
