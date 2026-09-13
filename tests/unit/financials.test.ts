import { describe, expect, it } from "vitest";

import {
  planFinancialsForCycle,
  retailForCycle,
  toAdminPlanView,
} from "@/lib/data/financials";
import type { Plan, ProviderProduct } from "@/types";

const now = Date.now();

const plan: Plan = {
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

const providerProduct: ProviderProduct = {
  id: "pp_1",
  planId: "plan_starter",
  providerId: "prov_bearhost",
  providerProductId: "bh_123",
  providerCost: 9000,
  currency: "TZS",
  createdAt: now,
  updatedAt: now,
};

describe("plan financials (server-internal)", () => {
  it("selects retail per billing cycle", () => {
    expect(retailForCycle(plan, "monthly")).toBe(15000);
    expect(retailForCycle(plan, "quarterly")).toBe(42000);
    expect(retailForCycle(plan, "annual")).toBe(150000);
  });

  it("amortizes provider cost across the cycle", () => {
    const monthly = planFinancialsForCycle(plan, providerProduct, "monthly");
    expect(monthly.providerCost).toBe(9000);
    expect(monthly.grossProfit).toBe(6000);
    expect(monthly.marginBps).toBe(4000); // 40%

    const quarterly = planFinancialsForCycle(
      plan,
      providerProduct,
      "quarterly",
    );
    expect(quarterly.providerCost).toBe(27000);
    expect(quarterly.retail).toBe(42000);
    expect(quarterly.grossProfit).toBe(15000);
  });

  it("applies a gateway fee in basis points", () => {
    const monthly = planFinancialsForCycle(
      plan,
      providerProduct,
      "monthly",
      250, // 2.5%
    );
    expect(monthly.gatewayFee).toBe(375); // 2.5% of 15000
    expect(monthly.grossProfit).toBe(15000 - 9000 - 375);
  });

  it("assembles a full admin plan view carrying provider identifiers", () => {
    const view = toAdminPlanView(plan, providerProduct, 250);
    expect(view.plan.id).toBe("plan_starter");
    expect(view.providerId).toBe("prov_bearhost");
    expect(view.providerProductId).toBe("bh_123");
    expect(view.financials.annual.retail).toBe(150000);
    expect(view.financials.annual.providerCost).toBe(108000);
    // The customer-safe plan embedded in the view still has no cost field.
    expect("providerCost" in view.plan).toBe(false);
  });
});
