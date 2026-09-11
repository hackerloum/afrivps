import type { Currency } from "@/types";
import { addMoney, money, multiplyMoney, type Money } from "@/lib/money";
import { ServiceNotImplementedError } from "./errors";
import type { Invoice, InvoiceLineItem } from "./types";

/**
 * InvoiceService (Sections 33, 46, 65).
 *
 * Owns invoice creation and status transitions. Invoice numbers come from an
 * atomic server-side counter (see `lib/ids.ts#invoiceNumber`). Payment status
 * is only ever changed server-side after verification — customers can never
 * flip an invoice to `paid` (enforced additionally by Firestore rules).
 *
 * Phase 1: typed contract + a real, pure total calculator (money-safe). The
 * persistence methods are stubs until Phase 2.
 */

export interface InvoiceTotals {
  /** All integer minor units. */
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: Currency;
}

export interface CreateInvoiceInput {
  customerId: string;
  orderId: string;
  items: InvoiceLineItem[];
  currency: Currency;
  /** Integer minor units. */
  discount?: number;
  tax?: number;
  dueInDays?: number;
}

export interface InvoiceService {
  createInvoice(input: CreateInvoiceInput): Promise<Invoice>;
  getInvoice(invoiceId: string): Promise<Invoice | null>;
  listCustomerInvoices(customerId: string): Promise<Invoice[]>;
  /** Server-only: mark paid after verified payment (Sections 32, 44). */
  markPaid(invoiceId: string, transactionReference: string): Promise<Invoice>;
}

const SERVICE = "InvoiceService";

/**
 * Pure, money-safe total computation (available in Phase 1). Uses integer
 * minor-unit arithmetic via `lib/money.ts`; never floating point (Section 18).
 */
export function computeInvoiceTotals(
  items: InvoiceLineItem[],
  currency: Currency,
  discount = 0,
  tax = 0,
): InvoiceTotals {
  const subtotal = items.reduce<Money>(
    (acc, item) =>
      addMoney(acc, multiplyMoney(money(item.unitAmount, currency), item.quantity)),
    money(0, currency),
  );

  const discountMoney = money(discount, currency);
  const taxMoney = money(tax, currency);
  const total = addMoney(
    addMoney(subtotal, taxMoney),
    money(-discountMoney.amount, currency),
  );

  return {
    subtotal: subtotal.amount,
    discount: discountMoney.amount,
    tax: taxMoney.amount,
    total: total.amount,
    currency,
  };
}

/** Phase 1 stub for persistence-bound methods. */
export class Phase1InvoiceService implements InvoiceService {
  async createInvoice(): Promise<Invoice> {
    throw new ServiceNotImplementedError(SERVICE, "createInvoice", "Phase 2");
  }
  async getInvoice(): Promise<Invoice | null> {
    throw new ServiceNotImplementedError(SERVICE, "getInvoice", "Phase 2");
  }
  async listCustomerInvoices(): Promise<Invoice[]> {
    throw new ServiceNotImplementedError(
      SERVICE,
      "listCustomerInvoices",
      "Phase 2",
    );
  }
  async markPaid(): Promise<Invoice> {
    throw new ServiceNotImplementedError(SERVICE, "markPaid", "Phase 2");
  }
}
