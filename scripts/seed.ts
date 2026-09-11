/**
 * Development seed script (Section 71).
 *
 * Seeds DEMO data into the Firebase EMULATORS only. Values here are clearly
 * marked development values — they are NOT official production prices and no
 * real passwords are shipped to production.
 *
 * Run via:  pnpm seed:emulated   (recommended — starts emulators)
 *      or:  firebase emulators:exec --only firestore,auth "tsx scripts/seed.ts"
 */

import { initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "demo-afrivps";

// Point the Admin SDK at the emulators. Refuse to run against anything that is
// not clearly an emulator/demo project to avoid touching production data.
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";

if (!PROJECT_ID.startsWith("demo-") && !process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error(
    "Refusing to seed: this does not look like an emulator/demo project.",
  );
}

// ---- DEV-ONLY credentials (emulator only; never production) ----
const DEV_ADMIN = {
  email: "admin@afrivps.dev",
  password: "AfriVPS-dev-admin-1",
  fullName: "AfriVPS Admin (dev)",
};
const DEV_CUSTOMER = {
  email: "customer@afrivps.dev",
  password: "AfriVPS-dev-customer-1",
  fullName: "Demo Customer (dev)",
};

const now = Date.now();

interface SeedPlan {
  id: string;
  publicReference: string;
  name: string;
  slug: string;
  productType: "linux_vps" | "windows_vps" | "windows_rdp" | "cpanel";
  description: string;
  cpuCores: number;
  ramMB: number;
  storageGB: number;
  storageType: "nvme" | "ssd" | "hdd";
  bandwidthGB: number;
  portSpeedMbps: number;
  ipv4Count: number;
  ipv6Enabled: boolean;
  supportedOperatingSystems: string[];
  windowsEnabled: boolean;
  locationIds: string[];
  monthlyPrice: number; // TZS minor units (shillings)
  quarterlyPrice: number;
  annualPrice: number;
  currency: "TZS" | "USD";
  setupFee: number;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  availability: "available" | "sold_out" | "coming_soon";
  // provider cost is stored separately (see providerProducts)
  providerCost: number;
}

const LINUX_OS = ["os_ubuntu_2404", "os_debian_12", "os_alma_9"];
const WINDOWS_OS = ["os_windows_2022"];
const LOCATIONS = ["loc_dar", "loc_jhb"];

// NOTE: DEV pricing only — not official production prices.
const PLANS: SeedPlan[] = [
  {
    id: "plan_starter",
    publicReference: "AF-PLN-STR01",
    name: "Starter VPS",
    slug: "starter-vps",
    productType: "linux_vps",
    description: "Great for small sites, bots and dev environments.",
    cpuCores: 1,
    ramMB: 1024,
    storageGB: 25,
    storageType: "nvme",
    bandwidthGB: 1000,
    portSpeedMbps: 1000,
    ipv4Count: 1,
    ipv6Enabled: true,
    supportedOperatingSystems: LINUX_OS,
    windowsEnabled: false,
    locationIds: LOCATIONS,
    monthlyPrice: 15000,
    quarterlyPrice: 42000,
    annualPrice: 150000,
    currency: "TZS",
    setupFee: 0,
    active: true,
    featured: false,
    displayOrder: 1,
    availability: "available",
    providerCost: 9000,
  },
  {
    id: "plan_growth",
    publicReference: "AF-PLN-GRW01",
    name: "Growth VPS",
    slug: "growth-vps",
    productType: "linux_vps",
    description: "Balanced compute for growing applications and APIs.",
    cpuCores: 2,
    ramMB: 4096,
    storageGB: 80,
    storageType: "nvme",
    bandwidthGB: 3000,
    portSpeedMbps: 1000,
    ipv4Count: 1,
    ipv6Enabled: true,
    supportedOperatingSystems: LINUX_OS,
    windowsEnabled: false,
    locationIds: LOCATIONS,
    monthlyPrice: 35000,
    quarterlyPrice: 99000,
    annualPrice: 350000,
    currency: "TZS",
    setupFee: 0,
    active: true,
    featured: true,
    displayOrder: 2,
    availability: "available",
    providerCost: 21000,
  },
  {
    id: "plan_business",
    publicReference: "AF-PLN-BIZ01",
    name: "Business VPS",
    slug: "business-vps",
    productType: "linux_vps",
    description: "For production databases and busy web workloads.",
    cpuCores: 4,
    ramMB: 8192,
    storageGB: 160,
    storageType: "nvme",
    bandwidthGB: 5000,
    portSpeedMbps: 1000,
    ipv4Count: 1,
    ipv6Enabled: true,
    supportedOperatingSystems: LINUX_OS,
    windowsEnabled: false,
    locationIds: LOCATIONS,
    monthlyPrice: 65000,
    quarterlyPrice: 184000,
    annualPrice: 650000,
    currency: "TZS",
    setupFee: 0,
    active: true,
    featured: false,
    displayOrder: 3,
    availability: "available",
    providerCost: 39000,
  },
  {
    id: "plan_performance",
    publicReference: "AF-PLN-PRF01",
    name: "Performance VPS",
    slug: "performance-vps",
    productType: "linux_vps",
    description: "High-core compute for demanding, latency-sensitive apps.",
    cpuCores: 8,
    ramMB: 16384,
    storageGB: 320,
    storageType: "nvme",
    bandwidthGB: 8000,
    portSpeedMbps: 1000,
    ipv4Count: 2,
    ipv6Enabled: true,
    supportedOperatingSystems: LINUX_OS,
    windowsEnabled: false,
    locationIds: LOCATIONS,
    monthlyPrice: 120000,
    quarterlyPrice: 342000,
    annualPrice: 1200000,
    currency: "TZS",
    setupFee: 0,
    active: true,
    featured: false,
    displayOrder: 4,
    availability: "available",
    providerCost: 72000,
  },
  {
    id: "plan_windows",
    publicReference: "AF-PLN-WIN01",
    name: "Windows VPS",
    slug: "windows-vps",
    productType: "windows_vps",
    description: "Licensed Windows Server with Remote Desktop access.",
    cpuCores: 4,
    ramMB: 8192,
    storageGB: 120,
    storageType: "nvme",
    bandwidthGB: 4000,
    portSpeedMbps: 1000,
    ipv4Count: 1,
    ipv6Enabled: true,
    supportedOperatingSystems: WINDOWS_OS,
    windowsEnabled: true,
    locationIds: LOCATIONS,
    monthlyPrice: 90000,
    quarterlyPrice: 255000,
    annualPrice: 900000,
    currency: "TZS",
    setupFee: 10000,
    active: true,
    featured: false,
    displayOrder: 5,
    availability: "available",
    providerCost: 60000,
  },
];

const OPERATING_SYSTEMS = [
  { id: "os_ubuntu_2404", name: "Ubuntu 24.04 LTS", family: "linux", version: "24.04", active: true },
  { id: "os_debian_12", name: "Debian 12", family: "linux", version: "12", active: true },
  { id: "os_alma_9", name: "AlmaLinux 9", family: "linux", version: "9", active: true },
  { id: "os_windows_2022", name: "Windows Server 2022", family: "windows", version: "2022", active: true },
];

const SEED_LOCATIONS = [
  { id: "loc_dar", name: "Dar es Salaam", code: "DAR", country: "Tanzania", city: "Dar es Salaam", active: true, displayOrder: 1 },
  { id: "loc_jhb", name: "Johannesburg", code: "JHB", country: "South Africa", city: "Johannesburg", active: true, displayOrder: 2 },
];

const PROVIDERS = [
  {
    id: "provider_manual",
    name: "AfriVPS Manual Operations",
    code: "manual",
    enabled: true,
    provisioningMode: "manual",
    supportedProducts: ["linux_vps", "windows_vps", "windows_rdp"],
    priority: 1,
    capabilities: ["create", "suspend", "unsuspend", "terminate"],
    healthStatus: "healthy",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "provider_bearhost",
    name: "BearHost (upstream)",
    code: "bearhost",
    // Disabled placeholder: API access not yet available. Never customer-facing.
    enabled: false,
    provisioningMode: "api",
    supportedProducts: ["linux_vps", "windows_vps", "windows_rdp", "cpanel"],
    priority: 2,
    capabilities: [],
    healthStatus: "unknown",
    createdAt: now,
    updatedAt: now,
  },
];

// Payment providers mirror `providers/payments` registry codes. Only manual is
// enabled at launch; API adapters stay disabled until configured (Section 67).
const PAYMENT_PROVIDERS = [
  {
    id: "pp_manual",
    code: "manual",
    name: "Manual (Mobile Money / Bank Transfer)",
    mode: "manual",
    enabled: true,
    methods: ["mobile_money", "bank_transfer", "admin_confirmation"],
    priority: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pp_flutterwave",
    code: "flutterwave",
    name: "Flutterwave",
    mode: "api",
    enabled: false,
    methods: [],
    priority: 2,
    note: "Disabled placeholder — enable once API credentials are configured.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pp_pesapal",
    code: "pesapal",
    name: "Pesapal",
    mode: "api",
    enabled: false,
    methods: [],
    priority: 3,
    note: "Disabled placeholder — enable once API credentials are configured.",
    createdAt: now,
    updatedAt: now,
  },
];

// Feature flags (Section 52). New integrations stay OFF until ready/tested.
const FEATURE_FLAGS = {
  automaticProvisioning: false,
  automaticSuspension: false,
  automaticTermination: false,
  flutterwavePayments: false,
  pesapalPayments: false,
  windowsVps: true,
  cpanelHosting: false,
  coupons: false,
  referrals: false,
  pushNotifications: false,
};

function adminApp(): App {
  // No credential needed: the Admin SDK connects to the emulators via the
  // *_EMULATOR_HOST env vars set above.
  return initializeApp({ projectId: PROJECT_ID });
}

async function upsertUser(
  auth: ReturnType<typeof getAuth>,
  email: string,
  password: string,
  displayName: string,
  claims?: Record<string, unknown>,
): Promise<string> {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
  } catch {
    const created = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
    uid = created.uid;
  }
  if (claims) {
    await auth.setCustomUserClaims(uid, claims);
  }
  return uid;
}

async function main(): Promise<void> {
  const app = adminApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  console.log(`\nSeeding DEV data into emulators (project: ${PROJECT_ID})`);
  console.log(`  Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  console.log(`  Auth:      ${process.env.FIREBASE_AUTH_EMULATOR_HOST}\n`);

  const batch = db.batch();

  // Operating systems
  for (const os of OPERATING_SYSTEMS) {
    batch.set(db.collection("operatingSystems").doc(os.id), os);
  }
  // Locations (DEV values)
  for (const loc of SEED_LOCATIONS) {
    batch.set(db.collection("locations").doc(loc.id), loc);
  }
  // Providers (infrastructure)
  for (const provider of PROVIDERS) {
    batch.set(db.collection("providers").doc(provider.id), provider);
  }
  // Payment providers
  for (const pp of PAYMENT_PROVIDERS) {
    batch.set(db.collection("paymentProviders").doc(pp.id), pp);
  }
  // System settings: feature flags + an explicit DEV environment marker so it
  // is obvious this data is seeded development data, not production.
  batch.set(db.collection("systemSettings").doc("featureFlags"), {
    ...FEATURE_FLAGS,
    updatedAt: now,
  });
  batch.set(db.collection("systemSettings").doc("environment"), {
    environment: "development",
    seededAt: now,
    note: "DEV seed data — demo values only, NOT official production prices or accounts.",
  });

  // Plans (customer-safe) + providerProducts (server-only cost mapping)
  for (const plan of PLANS) {
    const { providerCost, ...safePlan } = plan;
    batch.set(db.collection("plans").doc(plan.id), {
      ...safePlan,
      createdAt: now,
      updatedAt: now,
    });
    // Provider cost lives ONLY here — never in the public plan doc.
    batch.set(db.collection("providerProducts").doc(plan.id), {
      id: plan.id,
      planId: plan.id,
      providerId: "provider_manual",
      providerProductId: `manual-${plan.slug}`,
      providerCost,
      currency: plan.currency,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(
    `  ✓ ${PLANS.length} plans, ${OPERATING_SYSTEMS.length} OS images, ${SEED_LOCATIONS.length} locations, ${PROVIDERS.length} infra providers, ${PAYMENT_PROVIDERS.length} payment providers, feature flags`,
  );

  // Dev accounts
  const adminUid = await upsertUser(
    auth,
    DEV_ADMIN.email,
    DEV_ADMIN.password,
    DEV_ADMIN.fullName,
    { role: "super_admin" },
  );
  await db.collection("users").doc(adminUid).set({
    uid: adminUid,
    customerReference: "AF-CUS-ADMIN",
    email: DEV_ADMIN.email,
    emailVerified: true,
    fullName: DEV_ADMIN.fullName,
    role: "super_admin",
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("staff").doc(adminUid).set({
    uid: adminUid,
    email: DEV_ADMIN.email,
    role: "super_admin",
    createdAt: now,
    updatedAt: now,
  });

  const customerUid = await upsertUser(
    auth,
    DEV_CUSTOMER.email,
    DEV_CUSTOMER.password,
    DEV_CUSTOMER.fullName,
    { role: "customer" },
  );
  await db.collection("users").doc(customerUid).set({
    uid: customerUid,
    customerReference: "AF-CUS-DEMO1",
    email: DEV_CUSTOMER.email,
    emailVerified: true,
    fullName: DEV_CUSTOMER.fullName,
    role: "customer",
    createdAt: now,
    updatedAt: now,
  });

  console.log("  ✓ dev accounts (EMULATOR ONLY — do not use these in production):");
  console.log(`      super_admin: ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`);
  console.log(`      customer:    ${DEV_CUSTOMER.email} / ${DEV_CUSTOMER.password}`);
  console.log("\nSeed complete.\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
