import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { pageMetadata } from "@/components/marketing/seo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = pageMetadata({
  title: "Status",
  description:
    "AfriVPS platform status, maintained by our operations team. No fabricated uptime figures.",
  path: "/status",
});

// Status is administrator-updated for now (Section 53). No fabricated uptime.
const SERVICES = [
  "Website",
  "Customer Portal",
  "Provisioning",
  "Payment Systems",
  "Support",
] as const;

export default function StatusPage() {
  return (
    <div>
      <PageHero
        eyebrow="Status"
        title="Platform status"
        description="Component status is maintained by our operations team. Automated monitoring will be integrated over time — we do not publish fabricated uptime figures."
      />
      <Section className="py-16">
        <Card className="divide-y divide-border p-0">
          {SERVICES.map((service) => (
            <div
              key={service}
              className="flex items-center justify-between px-6 py-4"
            >
              <span className="text-sm font-medium text-foreground">
                {service}
              </span>
              <Badge variant="success">
                <span className="size-1.5 rounded-full bg-success" />
                Operational
              </Badge>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}
