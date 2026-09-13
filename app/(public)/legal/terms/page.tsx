import { LegalPage } from "@/components/marketing/legal-page";
import { pageMetadata } from "@/components/marketing/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of AfriVPS services.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of AfriVPS services."
      sections={[
        {
          heading: "1. Services",
          body: "AfriVPS provides virtual private servers, Windows servers and related hosting services subject to availability and these terms.",
        },
        {
          heading: "2. Accounts",
          body: "You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it.",
        },
        {
          heading: "3. Billing",
          body: "Services are billed per the selected billing cycle. Payments are verified before provisioning. Prices are shown in TZS and USD.",
        },
        {
          heading: "4. Acceptable use",
          body: "Use of AfriVPS services is subject to the Acceptable Use Policy. Prohibited activity may result in suspension.",
        },
      ]}
    />
  );
}
