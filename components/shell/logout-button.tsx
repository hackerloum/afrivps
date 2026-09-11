"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
