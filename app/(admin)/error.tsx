"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-elevated">
          <ShieldAlert className="size-6 text-warning" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have permission to view this section, or the request
          could not be completed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/admin">Back to overview</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
