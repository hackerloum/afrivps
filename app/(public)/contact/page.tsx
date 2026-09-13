import { Mail, MessageSquare } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { pageMetadata } from "@/components/marketing/seo";
import { Card } from "@/components/ui/card";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with AfriVPS about plans, billing or your account.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about plans, billing or your account? Reach out and our team will help."
      />
      <Section className="py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-8">
            <MessageSquare className="size-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Support tickets
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The fastest way to reach us is through a support ticket from your
              dashboard once you have an account.
            </p>
          </Card>
          <Card className="p-8">
            <Mail className="size-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Email
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For general enquiries, email is monitored during business hours.
              Contact details are configured per environment.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
