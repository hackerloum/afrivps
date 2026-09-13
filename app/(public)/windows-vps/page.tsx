import { KeyRound, MonitorCheck, ShieldCheck } from "lucide-react";

import { ProductLanding } from "@/components/marketing/product-landing";
import { pageMetadata } from "@/components/marketing/seo";
import { getPlansByTypeSafe } from "@/lib/data/plans";
import type { Plan } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Windows VPS & RDP",
  description:
    "Licensed Windows Server and RDP with straightforward pricing for African businesses.",
  path: "/windows-vps",
});

export default async function WindowsVpsPage() {
  const [windowsVps, windowsRdp] = await Promise.all([
    getPlansByTypeSafe("windows_vps"),
    getPlansByTypeSafe("windows_rdp"),
  ]);
  const plans: Plan[] = [...windowsVps, ...windowsRdp];

  return (
    <ProductLanding
      eyebrow="Windows VPS & RDP"
      title="Windows servers, done right"
      description="Run licensed Windows Server or Remote Desktop with predictable pricing and support that responds."
      features={["Licensed Windows", "Remote Desktop", "Admin access", "IPv4 included"]}
      highlights={[
        {
          icon: MonitorCheck,
          title: "Windows Server ready",
          body: "Deploy applications that require a genuine Windows environment.",
        },
        {
          icon: KeyRound,
          title: "Remote Desktop access",
          body: "Connect securely over RDP with administrator credentials.",
        },
        {
          icon: ShieldCheck,
          title: "Managed onboarding",
          body: "Our team provisions and hands over access while automation rolls out.",
        },
      ]}
      plans={plans}
    />
  );
}
