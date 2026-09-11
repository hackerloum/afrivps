import { readFileSync } from "node:fs";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "demo-afrivps";

const USER_A = "customer-a";
const USER_B = "customer-b";
const SUPPORT = "support-user";
const SUPER_ADMIN = "super-admin-user";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  // Seed baseline data with rules disabled (simulates trusted server writes).
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "orders", "order-b"), {
      customerId: USER_B,
      status: "paid",
      createdAt: Date.now(),
    });
    await setDoc(doc(db, "orders", "order-a"), {
      customerId: USER_A,
      status: "pending_payment",
      createdAt: Date.now(),
    });
    await setDoc(doc(db, "invoices", "inv-a"), {
      customerId: USER_A,
      status: "paid",
      total: 15000,
    });
    await setDoc(doc(db, "services", "svc-a"), {
      customerId: USER_A,
      status: "pending_payment",
    });
    await setDoc(doc(db, "providers", "provider_manual"), {
      code: "manual",
      providerCost: 9000,
    });
    await setDoc(doc(db, "providerProducts", "plan_starter"), {
      planId: "plan_starter",
      providerCost: 9000,
    });
    await setDoc(doc(db, "plans", "plan_starter"), {
      name: "Starter VPS",
      active: true,
      monthlyPrice: 15000,
      displayOrder: 1,
    });
    await setDoc(doc(db, "staff", SUPER_ADMIN), {
      uid: SUPER_ADMIN,
      role: "super_admin",
    });
    await setDoc(doc(db, "users", USER_A), {
      uid: USER_A,
      role: "customer",
      email: "a@example.com",
    });
  });
});

function customer(uid: string) {
  return testEnv.authenticatedContext(uid, { email_verified: true }).firestore();
}
function staff(uid: string, role: string) {
  return testEnv.authenticatedContext(uid, { role }).firestore();
}
function anonymous() {
  return testEnv.unauthenticatedContext().firestore();
}

describe("Firestore security rules (Section 70)", () => {
  it("Customer A cannot read Customer B's orders", async () => {
    await assertFails(getDoc(doc(customer(USER_A), "orders", "order-b")));
  });

  it("Customer can read their OWN order", async () => {
    await assertSucceeds(getDoc(doc(customer(USER_A), "orders", "order-a")));
  });

  it("Customer cannot modify a paid invoice's status", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "invoices", "inv-a"), {
        status: "refunded",
      }),
    );
  });

  it("Customer cannot activate their own service", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "services", "svc-a"), {
        status: "active",
      }),
    );
  });

  it("Customer cannot modify provider cost", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "providerProducts", "plan_starter"), {
        providerCost: 1,
      }),
    );
    await assertFails(
      setDoc(doc(customer(USER_A), "providerProducts", "plan_new"), {
        providerCost: 1,
      }),
    );
  });

  it("Customer cannot read provider configuration", async () => {
    await assertFails(
      getDoc(doc(customer(USER_A), "providers", "provider_manual")),
    );
  });

  it("Customer cannot escalate their own role", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "users", USER_A), {
        role: "super_admin",
      }),
    );
  });

  it("Customer CAN update non-privileged profile fields", async () => {
    await assertSucceeds(
      updateDoc(doc(customer(USER_A), "users", USER_A), {
        fullName: "Updated Name",
      }),
    );
  });

  it("Support cannot modify staff/super_admin roles", async () => {
    await assertFails(
      updateDoc(doc(staff(SUPPORT, "support"), "staff", SUPER_ADMIN), {
        role: "support",
      }),
    );
  });

  it("Support cannot read provider costs", async () => {
    await assertFails(
      getDoc(doc(staff(SUPPORT, "support"), "providers", "provider_manual")),
    );
  });

  it("super_admin CAN modify staff roles", async () => {
    await assertSucceeds(
      updateDoc(doc(staff(SUPER_ADMIN, "super_admin"), "staff", SUPER_ADMIN), {
        role: "admin",
      }),
    );
  });

  it("Unauthenticated users cannot access private resources", async () => {
    await assertFails(getDoc(doc(anonymous(), "orders", "order-b")));
    await assertFails(getDoc(doc(anonymous(), "invoices", "inv-a")));
    await assertFails(getDoc(doc(anonymous(), "services", "svc-a")));
  });

  it("Public catalog (plans) is readable by anyone", async () => {
    await assertSucceeds(getDoc(doc(anonymous(), "plans", "plan_starter")));
  });

  it("Customers cannot write to the public catalog", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "plans", "plan_starter"), {
        monthlyPrice: 1,
      }),
    );
  });
});
