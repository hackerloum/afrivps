import { describe, expect, it } from "vitest";

import {
  CURRENCIES,
  INVOICE_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_TYPES,
  PROVISIONING_JOB_STATUSES,
  SERVICE_STATUSES,
  STAFF_ROLES,
  TICKET_STATUSES,
} from "@/types";
import type {
  Currency,
  InvoiceStatus,
  OrderStatus,
  PaymentStatus,
  ProductType,
  ProvisioningJobStatus,
  ServiceStatus,
  StaffRole,
  TicketStatus,
} from "@/types";

/**
 * Compile-time parity guard: each `as const` array must exactly match its
 * derived union. If a maintainer edits one without the other, `tsc` fails here.
 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

type _Assertions = [
  Expect<Equal<(typeof CURRENCIES)[number], Currency>>,
  Expect<Equal<(typeof STAFF_ROLES)[number], StaffRole>>,
  Expect<Equal<(typeof PRODUCT_TYPES)[number], ProductType>>,
  Expect<Equal<(typeof SERVICE_STATUSES)[number], ServiceStatus>>,
  Expect<Equal<(typeof ORDER_STATUSES)[number], OrderStatus>>,
  Expect<Equal<(typeof INVOICE_STATUSES)[number], InvoiceStatus>>,
  Expect<Equal<(typeof PAYMENT_STATUSES)[number], PaymentStatus>>,
  Expect<Equal<(typeof TICKET_STATUSES)[number], TicketStatus>>,
  Expect<
    Equal<(typeof PROVISIONING_JOB_STATUSES)[number], ProvisioningJobStatus>
  >,
];

describe("status enum parity", () => {
  it("keeps runtime arrays and unions aligned (compile-time enforced)", () => {
    // Runtime sanity checks; the real guarantee is the type assertions above.
    expect(new Set(SERVICE_STATUSES).size).toBe(SERVICE_STATUSES.length);
    expect(CURRENCIES).toContain("TZS");
    expect(STAFF_ROLES).toContain("super_admin");
  });
});
