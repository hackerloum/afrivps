import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const ROUTES: {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/vps", priority: 0.9, changeFrequency: "weekly" },
  { path: "/windows-vps", priority: 0.9, changeFrequency: "weekly" },
  { path: "/web-hosting", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/network", priority: 0.6, changeFrequency: "monthly" },
  { path: "/status", priority: 0.5, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/support", priority: 0.6, changeFrequency: "monthly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/aup", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
