import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, LifeBuoy, Ticket } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support",
  description: "AfriVPS support center.",
};

export default function SupportPage() {
  return (
    <div>
      <PageHero
        eyebrow="Support"
        title="We are here to help"
        description="Billing, technical and general support through a proper ticketing system."
      />
      <Section className="py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="p-6">
            <Ticket className="size-5 text-accent" />
            <h3 className="mt-4 font-semibold text-foreground">Open a ticket</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in and open a ticket from your dashboard to reach our team.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/login">Sign in</Link>
            </Button>
          </Card>
          <Card className="p-6">
            <BookOpen className="size-5 text-accent" />
            <h3 className="mt-4 font-semibold text-foreground">Guides</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Documentation and setup guides are being expanded.
            </p>
          </Card>
          <Card className="p-6">
            <LifeBuoy className="size-5 text-accent" />
            <h3 className="mt-4 font-semibold text-foreground">Departments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sales, Billing, Technical Support and General enquiries.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
