import type { Metadata } from "next";
import { Globe, Mail, Shield } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Web Hosting",
  description: "cPanel web hosting for websites and email, built for African businesses.",
};

const FEATURES = [
  {
    icon: Globe,
    title: "cPanel hosting",
    body: "Familiar cPanel management for websites, domains and databases.",
  },
  {
    icon: Mail,
    title: "Business email",
    body: "Professional mailboxes on your own domain.",
  },
  {
    icon: Shield,
    title: "SSL included",
    body: "Free SSL certificates to keep your sites secure.",
  },
] as const;

export default function WebHostingPage() {
  return (
    <div>
      <PageHero
        eyebrow="Web Hosting"
        title="cPanel hosting for websites and email"
        description="Web hosting plans are being finalized. Create an account and we will notify you when cPanel hosting is available."
      />
      <Section className="py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
                <f.icon className="size-5 text-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
