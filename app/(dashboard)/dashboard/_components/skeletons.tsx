import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton loaders for the customer control panel. These are rendered by the
 * per-route `loading.tsx` files as Next.js streaming/navigation fallbacks, so
 * pages that fetch customer data in a later phase get an instant, non-fake
 * loading state (Sections 13, 56, 57).
 */

function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      {withAction && <Skeleton className="h-10 w-36" />}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded" />
      </div>
      <Skeleton className="mt-3 h-8 w-12" />
    </Card>
  );
}

function ListRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="divide-y divide-border p-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="size-10 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </Card>
  );
}

export function OverviewSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="mb-3 h-4 w-32" />
          <ListRowsSkeleton />
        </div>
        <div>
          <Skeleton className="mb-3 h-4 w-32" />
          <ListRowsSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton({
  withAction = false,
  rows = 4,
}: {
  withAction?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <PageHeaderSkeleton withAction={withAction} />
      <ListRowsSkeleton rows={rows} />
    </div>
  );
}

export function CardsPageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DetailPanelsSkeleton({
  panels = 2,
  className,
}: {
  panels?: number;
  className?: string;
}) {
  return (
    <div>
      <PageHeaderSkeleton withAction={false} />
      <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
        {Array.from({ length: panels }).map((_, i) => (
          <Card key={i} className="space-y-4 p-6">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
