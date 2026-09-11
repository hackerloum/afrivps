import type { BillingCycle, OrderStatus } from "@/types";
import { ServiceNotImplementedError } from "./errors";
import type { Order } from "./types";

/**
 * OrderService (Sections 22, 44, 65).
 *
 * Centralizes order lifecycle transitions so Firestore mutations are never
 * scattered across pages/components. The customer sends selected IDs/options;
 * the server (this service) is the ONLY place that fetches plan data, computes
 * the official price, and creates the order + invoice atomically (Section 44).
 * Browser-supplied prices are never trusted.
 *
 * Phase 1: typed contract + stub. Persistence lands in Phase 2.
 */

/** Validated selection a customer submits at checkout (IDs/options only). */
export interface CreateOrderInput {
  customerId: string;
  planId: string;
  billingCycle: BillingCycle;
  operatingSystemId: string;
  locationId: string;
  hostname: string;
  discountCode?: string;
}

export interface ListOrdersOptions {
  status?: OrderStatus;
  limit?: number;
  /** Opaque cursor (document id) for pagination (Section 47). */
  startAfter?: string;
}

export interface OrderService {
  /** Create an order (server recomputes price from Firestore, Section 44). */
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  listCustomerOrders(
    customerId: string,
    options?: ListOrdersOptions,
  ): Promise<Order[]>;
  /** Server-side state transition (e.g. pending_payment → paid). */
  transitionStatus(orderId: string, next: OrderStatus): Promise<Order>;
}

const SERVICE = "OrderService";

/** Phase 1 stub. Methods throw until Phase 2 wires Firestore persistence. */
export class Phase1OrderService implements OrderService {
  async createOrder(): Promise<Order> {
    throw new ServiceNotImplementedError(SERVICE, "createOrder", "Phase 2");
  }
  async getOrder(): Promise<Order | null> {
    throw new ServiceNotImplementedError(SERVICE, "getOrder", "Phase 2");
  }
  async listCustomerOrders(): Promise<Order[]> {
    throw new ServiceNotImplementedError(
      SERVICE,
      "listCustomerOrders",
      "Phase 2",
    );
  }
  async transitionStatus(): Promise<Order> {
    throw new ServiceNotImplementedError(
      SERVICE,
      "transitionStatus",
      "Phase 2",
    );
  }
}
