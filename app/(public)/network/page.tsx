import { MapPin } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { pageMetadata } from "@/components/marketing/seo";
import { Card } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase/admin";
import type { Location } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Network",
  description:
    "AfriVPS network locations and infrastructure, managed from our systems — never fabricated.",
  path: "/network",
});

async function getLocations(): Promise<Location[]> {
  try {
    const snap = await adminDb()
      .collection("locations")
      .where("active", "==", true)
      .get();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Location, "id">) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch {
    return [];
  }
}

export default async function NetworkPage() {
  const locations = await getLocations();

  return (
    <div>
      <PageHero
        eyebrow="Network"
        title="Our infrastructure footprint"
        description="Network locations are managed from our systems and reflect only real, configured infrastructure — we never fabricate data centres or metrics."
      />
      <Section className="py-16">
        {locations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => (
              <Card key={loc.id} className="p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-accent" />
                  <div>
                    <h3 className="font-semibold text-foreground">{loc.city}</h3>
                    <p className="text-sm text-muted-foreground">
                      {loc.country} · {loc.code}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Network locations will appear here once configured. Infrastructure
              details are managed from Firestore, not hardcoded.
            </p>
          </Card>
        )}
      </Section>
    </div>
  );
}
