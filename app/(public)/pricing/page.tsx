import { PricingPlans } from "@/components/marketing/pricing-plans";
import { pageMetadata } from "@/components/marketing/seo";
import { Section, SectionHeading } from "@/components/marketing/section";
import { getActivePlansSafe } from "@/lib/data/plans";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Straightforward VPS pricing in TZS and USD. Monthly, quarterly and annual billing.",
  path: "/pricing",
});

export default async function PricingPage() {
  const plans = await getActivePlansSafe();

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-[0.3]" aria-hidden />
        <Section className="relative py-20">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent pricing, no surprises"
            description="Every plan is loaded live from our catalog. Choose the billing cycle that suits you."
          />
        </Section>
      </div>
      <Section className="py-16">
        <PricingPlans plans={plans} />
      </Section>
    </div>
  );
}
