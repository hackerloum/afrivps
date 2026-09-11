import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

// Default feature flags (Section 52). Persisted in `systemSettings` later.
const FEATURE_FLAGS: { key: string; label: string; enabled: boolean }[] = [
  { key: "automaticProvisioning", label: "Automatic provisioning", enabled: false },
  { key: "automaticSuspension", label: "Automatic suspension", enabled: false },
  { key: "automaticTermination", label: "Automatic termination", enabled: false },
  { key: "flutterwavePayments", label: "Flutterwave payments", enabled: false },
  { key: "pesapalPayments", label: "Pesapal payments", enabled: false },
  { key: "windowsVps", label: "Windows VPS", enabled: true },
  { key: "cpanelHosting", label: "cPanel hosting", enabled: false },
  { key: "coupons", label: "Discount coupons", enabled: false },
  { key: "referrals", label: "Referrals", enabled: false },
  { key: "pushNotifications", label: "Push notifications", enabled: false },
];

export default async function AdminSettingsPage() {
  await requirePermission("settings.manage");

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Platform configuration and feature flags. New integrations stay disabled until ready."
      />
      <Card className="divide-y divide-border p-0">
        {FEATURE_FLAGS.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between px-6 py-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {flag.label}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {flag.key}
              </p>
            </div>
            <Badge variant={flag.enabled ? "success" : "outline"}>
              {flag.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
