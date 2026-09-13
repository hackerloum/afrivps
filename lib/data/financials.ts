import { financials, money } from "@/lib/money";
import type {
  AdminPlanView,
  BillingCycle,
  FinancialBreakdown,
  Plan,
  ProviderProduct,
} from "@/types";

/**
 * Admin-only financial view-models (Section 46).
 *
 * SERVER-INTERNAL: the DTOs produced here expose upstream provider cost and
 * margin. They must only be assembled behind an authorized admin boundary and
 * must NEVER be serialized to a customer-facing client. Support staff are also
 * excluded by policy (see `provider_costs.read` in the permission layer). This
 * module is pure (no Firestore/`server-only`) so the arithmetic is unit-testable
 * in isolation; the caller owns the access-control boundary.
 */

/** Retail price for a given billing cycle, in integer minor units. */
export function retailForCycle(plan: Plan, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return plan.monthlyPrice;
    case "quarterly":
      return plan.quarterlyPrice;
    case "annual":
      return plan.annualPrice;
  }
}

/**
 * Amortize a per-month provider cost across a billing cycle so it lines up with
 * the retail price for that cycle.
 */
function providerCostForCycle(
  monthlyCost: number,
  cycle: BillingCycle,
): number {
  const months = cycle === "monthly" ? 1 : cycle === "quarterly" ? 3 : 12;
  return monthlyCost * months;
}

/**
 * Build a {@link FinancialBreakdown} for a single billing cycle.
 * `gatewayFeeBps` is applied to retail (basis points; 250 = 2.5%).
 */
export function planFinancialsForCycle(
  plan: Plan,
  providerProduct: Pick<ProviderProduct, "providerCost" | "currency">,
  cycle: BillingCycle,
  gatewayFeeBps = 0,
): FinancialBreakdown {
  const retail = money(retailForCycle(plan, cycle), plan.currency);
  const cost = money(
    providerCostForCycle(providerProduct.providerCost, cycle),
    plan.currency,
  );
  const gatewayFee = money(
    Math.round((retail.amount * gatewayFeeBps) / 10000),
    plan.currency,
  );
  return financials(retail, cost, gatewayFee);
}

/**
 * Assemble the full admin plan view (customer-safe plan + per-cycle financial
 * breakdowns). Server-internal only.
 */
export function toAdminPlanView(
  plan: Plan,
  providerProduct: Pick<
    ProviderProduct,
    "providerId" | "providerProductId" | "providerCost" | "currency"
  >,
  gatewayFeeBps = 0,
): AdminPlanView {
  return {
    plan,
    providerId: providerProduct.providerId,
    providerProductId: providerProduct.providerProductId,
    financials: {
      monthly: planFinancialsForCycle(
        plan,
        providerProduct,
        "monthly",
        gatewayFeeBps,
      ),
      quarterly: planFinancialsForCycle(
        plan,
        providerProduct,
        "quarterly",
        gatewayFeeBps,
      ),
      annual: planFinancialsForCycle(
        plan,
        providerProduct,
        "annual",
        gatewayFeeBps,
      ),
    },
  };
}
