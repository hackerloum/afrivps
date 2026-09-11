import { LegalPage } from "@/components/marketing/legal-page";
import { pageMetadata } from "@/components/marketing/seo";

export const metadata = pageMetadata({
  title: "Acceptable Use Policy",
  description:
    "Rules that keep the AfriVPS platform safe and reliable for everyone.",
  path: "/legal/aup",
});

export default function AupPage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      intro="Rules that keep the AfriVPS platform safe and reliable for everyone."
      sections={[
        {
          heading: "1. Prohibited activity",
          body: "You may not use AfriVPS services for unlawful activity, network abuse, distribution of malware, or unsolicited bulk messaging.",
        },
        {
          heading: "2. Resource usage",
          body: "Services must not be used in a way that degrades platform stability or the experience of other customers.",
        },
        {
          heading: "3. Enforcement",
          body: "Violations may result in suspension or termination. Where possible we will contact you before taking action.",
        },
      ]}
    />
  );
}
