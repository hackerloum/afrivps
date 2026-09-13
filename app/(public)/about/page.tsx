import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { pageMetadata } from "@/components/marketing/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About AfriVPS — cloud infrastructure for Africa, with transparent pricing and honest infrastructure.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About"
        title="Cloud infrastructure for Africa"
        description="AfriVPS provides VPS, Windows servers and hosting with straightforward pricing and support built for African businesses and developers."
      />
      <Section className="py-16">
        <div className="max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            AfriVPS is a cloud infrastructure provider focused on delivering
            fast, reliable and fairly-priced servers to customers across the
            continent.
          </p>
          <p>
            We keep our platform honest: pricing is transparent, infrastructure
            details reflect reality, and payments are always confirmed before we
            provision a service.
          </p>
          <p>
            As our automation matures, more of the server lifecycle becomes
            self-service — without changing the straightforward experience our
            customers rely on.
          </p>
        </div>
      </Section>
    </div>
  );
}
