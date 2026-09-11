import { LifeBuoy } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function DashboardSupportPage() {
  return (
    <div>
      <PageHeader
        title="Support"
        description="Your support tickets and conversations."
      />
      <EmptyState
        icon={LifeBuoy}
        title="No tickets yet"
        description="Open a ticket and our team will help with billing or technical questions."
        action={<Button disabled>New ticket (coming soon)</Button>}
      />
    </div>
  );
}
