/**
 * JSON-LD structured data for the public site (Section 55).
 *
 * Only stable, verifiable facts are emitted — no fabricated ratings, customer
 * counts or uptime figures (Section 16). The output is a single graph with the
 * organization and website entities.
 */
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "Fast VPS, Windows servers and hosting with straightforward pricing and support built for African businesses and developers.";

export function SiteJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: "AfriVPS",
        url: APP_URL,
        description: DESCRIPTION,
        slogan: "Cloud Infrastructure for Africa.",
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        name: "AfriVPS",
        url: APP_URL,
        description: DESCRIPTION,
        publisher: { "@id": `${APP_URL}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Static, developer-authored data — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
