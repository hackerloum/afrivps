import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div>
      <PageHero eyebrow="Legal" title={title} description={intro} />
      <Section className="py-16">
        <div className="max-w-3xl space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-semibold text-foreground">
                {s.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            This is placeholder legal content for the AfriVPS platform and is not
            legal advice. Finalized terms are configured before production
            launch.
          </p>
        </div>
      </Section>
    </div>
  );
}
