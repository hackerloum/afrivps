import { describe, expect, it } from "vitest";

import {
  currencySchema,
  minorUnitsSchema,
  pageParamsSchema,
  referenceSchema,
  serviceStatusSchema,
  slugSchema,
} from "@/schemas/common";
import { planSchema, providerProductSchema } from "@/schemas/catalog";
import { systemSettingsSchema } from "@/schemas/settings";
import { customerSchema } from "@/schemas/customer";
import type { Plan } from "@/types";

const now = Date.now();

const validPlan: Plan = {
  id: "plan_starter",
  publicReference: "AF-PLN-STR01",
  name: "Starter VPS",
  slug: "starter-vps",
  productType: "linux_vps",
  description: "Great for small sites.",
  cpuCores: 1,
  ramMB: 1024,
  storageGB: 25,
  storageType: "nvme",
  bandwidthGB: 1000,
  portSpeedMbps: 1000,
  ipv4Count: 1,
  ipv6Enabled: true,
  supportedOperatingSystems: ["os_ubuntu_2404"],
  windowsEnabled: false,
  locationIds: ["loc_dar"],
  monthlyPrice: 15000,
  quarterlyPrice: 42000,
  annualPrice: 150000,
  currency: "TZS",
  setupFee: 0,
  active: true,
  featured: false,
  displayOrder: 1,
  availability: "available",
  createdAt: now,
  updatedAt: now,
};

describe("common schemas", () => {
  it("validates enums and primitives", () => {
    expect(currencySchema.parse("TZS")).toBe("TZS");
    expect(currencySchema.safeParse("GBP").success).toBe(false);
    expect(serviceStatusSchema.safeParse("active").success).toBe(true);
    expect(serviceStatusSchema.safeParse("nope").success).toBe(false);
    expect(slugSchema.safeParse("starter-vps").success).toBe(true);
    expect(slugSchema.safeParse("Starter VPS").success).toBe(false);
    expect(referenceSchema.safeParse("AF-CUS-X9A72").success).toBe(true);
  });

  it("rejects non-integer money and negatives where required", () => {
    expect(minorUnitsSchema.safeParse(2599).success).toBe(true);
    expect(minorUnitsSchema.safeParse(25.99).success).toBe(false);
  });

  it("applies a bounded default limit for pagination", () => {
    expect(pageParamsSchema.parse({}).limit).toBe(20);
    expect(pageParamsSchema.safeParse({ limit: 1000 }).success).toBe(false);
    expect(pageParamsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });
});

describe("catalog schemas", () => {
  it("accepts a well-formed plan", () => {
    expect(planSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects a plan with a float price", () => {
    const bad = { ...validPlan, monthlyPrice: 150.5 };
    expect(planSchema.safeParse(bad).success).toBe(false);
  });

  it("validates a provider product cost mapping", () => {
    const result = providerProductSchema.safeParse({
      id: "pp_1",
      planId: "plan_starter",
      providerId: "prov_bearhost",
      providerProductId: "bh_123",
      providerCost: 9000,
      currency: "TZS",
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(true);
  });
});

describe("settings & customer schemas", () => {
  it("validates system settings with feature flags and renewal windows", () => {
    const result = systemSettingsSchema.safeParse({
      featureFlags: {
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
      },
      renewal: {
        invoiceLeadDays: 7,
        firstReminderDays: 3,
        secondReminderDays: 1,
        graceDays: 5,
        suspensionThresholdDays: 7,
        terminationThresholdDays: 30,
      },
      defaultCurrency: "TZS",
      defaultGatewayFeeBps: 250,
      updatedAt: now,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid customer email", () => {
    const result = customerSchema.safeParse({
      uid: "u1",
      customerReference: "AF-CUS-X9A72",
      email: "not-an-email",
      fullName: "Jane Doe",
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(false);
  });
});
