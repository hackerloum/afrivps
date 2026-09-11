import type { Metadata } from "next";

/**
 * Shared metadata builder for public marketing pages (Section 55).
 *
 * Produces per-page `title`/`description`, a canonical URL and matching
 * OpenGraph + Twitter cards. `metadataBase` is configured in the root layout,
 * so `path` may be a relative route (e.g. `/vps`) and Next.js resolves it to an
 * absolute URL for canonical + `og:url`.
 *
 * Note: Next.js replaces (does not deep-merge) the `openGraph`/`twitter`
 * objects when a route defines them, so this helper re-declares the stable
 * `type`/`siteName` fields to preserve them.
 */
const BRAND_SUFFIX = "AfriVPS";

interface PageSeoOptions {
  title: string;
  description: string;
  /** Route path, e.g. "/" or "/vps". Used for the canonical URL and og:url. */
  path: string;
}

export function pageMetadata({
  title,
  description,
  path,
}: PageSeoOptions): Metadata {
  // Branded, absolute title for social cards (the root template already
  // brands the browser tab title via "%s · AfriVPS").
  const socialTitle =
    path === "/" ? `${title} — ${BRAND_SUFFIX}` : `${title} · ${BRAND_SUFFIX}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: BRAND_SUFFIX,
      title: socialTitle,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
