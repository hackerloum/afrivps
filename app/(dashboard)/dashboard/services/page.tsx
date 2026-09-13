import Link from "next/link";
import { Server } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Services"
        description="Your VPS instances and hosting services."
      />
      <EmptyState
        icon={Server}
        title="No services yet"
        description="Deploy your first server to see it here."
        action={
          <Button asChild>
            <Link href="/pricing">Browse plans</Link>
          </Button>
        }
      />
    </div>
  );
}
