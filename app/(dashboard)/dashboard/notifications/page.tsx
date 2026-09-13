import { Bell } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Payment, provisioning and renewal updates."
      />
      <EmptyState
        icon={Bell}
        title="You're all caught up"
        description="Notifications about your services and billing will appear here."
      />
    </div>
  );
}
