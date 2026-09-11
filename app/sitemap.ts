import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const ROUTES = [
  "",
  "/vps",
  "/windows-vps",
  "/web-hosting",
  "/pricing",
  "/network",
  "/status",
  "/about",
  "/contact",
  "/support",
  "/legal/terms",
  "/legal/privacy",
  "/legal/aup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
