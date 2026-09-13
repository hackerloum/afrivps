import { Cpu, Gauge, ShieldCheck } from "lucide-react";

import { ProductLanding } from "@/components/marketing/product-landing";
import { pageMetadata } from "@/components/marketing/seo";
import { getPlansByTypeSafe } from "@/lib/data/plans";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Linux VPS",
  description:
    "High-performance Linux VPS with NVMe storage, full root access and popular distributions.",
  path: "/vps",
});

export default async function VpsPage() {
  const plans = await getPlansByTypeSafe("linux_vps");

  return (
    <ProductLanding
      eyebrow="Linux VPS"
      title="High-performance Linux VPS"
      description="KVM virtual machines with full root access, NVMe storage and the Linux distributions you already know."
      features={["Full root access", "NVMe storage", "IPv4 + IPv6", "Popular distros"]}
      highlights={[
        {
          icon: Cpu,
          title: "Dedicated vCPU performance",
          body: "Consistent compute for web apps, databases, CI runners and more.",
        },
        {
          icon: Gauge,
          title: "NVMe-backed storage",
          body: "Fast disk I/O so your workloads stay responsive under load.",
        },
        {
          icon: ShieldCheck,
          title: "Isolated & secure",
          body: "Full KVM isolation with security enforced across the platform.",
        },
      ]}
      plans={plans}
    />
  );
}
