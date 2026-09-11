import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Plan } from "@/types";

export function ProductLanding({
  eyebrow,
  title,
  description,
  highlights,
  features,
  plans,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: { icon: LucideIcon; title: string; body: string }[];
  features: string[];
  plans: Plan[];
}) {
  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-[0.3]" aria-hidden />
        <div className="absolute inset-0 bg-radial-fade" aria-hidden />
        <Section className="relative py-20">
          <Badge variant="accent" className="mb-5">
            {eyebrow}
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {features.map((f) => (
              <span
                key={f}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Check className="size-4 text-accent" />
                {f}
              </span>
            ))}
          </div>
        </Section>
      </div>

      <Section className="py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
                <item.icon className="size-5 text-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="border-t border-border bg-surface">
        <Section className="py-16">
          <SectionHeading title="Plans" eyebrow="Choose your size" />
          <div className="mt-8">
            <PricingPlans plans={plans} />
          </div>
        </Section>
      </div>
    </div>
  );
}
