import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid opacity-[0.3]" aria-hidden />
      <Section className="relative py-20">
        {eyebrow && (
          <Badge variant="accent" className="mb-5">
            {eyebrow}
          </Badge>
        )}
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </Section>
    </div>
  );
}
