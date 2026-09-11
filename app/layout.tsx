import type { Metadata, Viewport } from "next";

import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AfriVPS — Cloud Infrastructure for Africa",
    template: "%s · AfriVPS",
  },
  description:
    "Fast VPS, Windows servers and hosting with straightforward pricing and support built for African businesses and developers.",
  applicationName: "AfriVPS",
  openGraph: {
    type: "website",
    title: "AfriVPS — Cloud Infrastructure for Africa",
    description:
      "Fast VPS, Windows servers and hosting with straightforward pricing and support built for African businesses and developers.",
    siteName: "AfriVPS",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "AfriVPS — Cloud Infrastructure for Africa",
    description:
      "Fast VPS, Windows servers and hosting for African businesses and developers.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
