import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How AfriVPS collects, uses and protects your information."
      sections={[
        {
          heading: "1. Information we collect",
          body: "We collect account information you provide (such as name, email and billing details) and service usage data needed to operate the platform.",
        },
        {
          heading: "2. How we use information",
          body: "Information is used to provide services, process payments, provide support and secure the platform. We do not sell your personal data.",
        },
        {
          heading: "3. Security",
          body: "Access to your data is protected by authentication, security rules and server-side authorization. Sensitive credentials are never exposed to clients.",
        },
        {
          heading: "4. Your rights",
          body: "You may request access to or deletion of your account information subject to legal and operational requirements.",
        },
      ]}
    />
  );
}
