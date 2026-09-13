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
  deleteDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "demo-afrivps";

const USER_A = "customer-a";
const USER_B = "customer-b";
const USER_C = "customer-c"; // has no profile yet (used for create tests)
const SUPPORT = "support-user";
const FINANCE = "finance-user";
const ADMIN = "admin-user";
const SUPER_ADMIN = "super-admin-user";

let testEnv: RulesTestEnvironment;

// Resolve the emulator address from the standard env var injected by
// `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST=host:port), falling back to
// the firebase.json default so `pnpm test:rules` works unchanged.
function emulatorAddress(envVar: string, fallbackPort: number) {
  const raw = process.env[envVar];
  if (raw) {
    const [host, port] = raw.split(":");
    return { host, port: Number(port) };
  }
  return { host: "127.0.0.1", port: fallbackPort };
}

beforeAll(async () => {
  const { host, port } = emulatorAddress("FIRESTORE_EMULATOR_HOST", 8080);
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host,
      port,
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

    // orders
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

    // invoices
    await setDoc(doc(db, "invoices", "inv-a"), {
      customerId: USER_A,
      status: "paid",
      total: 15000,
    });
    await setDoc(doc(db, "invoices", "inv-b"), {
      customerId: USER_B,
      status: "unpaid",
      total: 20000,
    });

    // services
    await setDoc(doc(db, "services", "svc-a"), {
      customerId: USER_A,
      status: "pending_payment",
    });
    await setDoc(doc(db, "services", "svc-b"), {
      customerId: USER_B,
      status: "active",
    });

    // payments
    await setDoc(doc(db, "payments", "pay-a"), {
      customerId: USER_A,
      status: "paid",
      amount: 15000,
    });

    // providers / provider products (internal cost data)
    await setDoc(doc(db, "providers", "provider_manual"), {
      code: "manual",
      providerCost: 9000,
    });
    await setDoc(doc(db, "providerProducts", "plan_starter"), {
      planId: "plan_starter",
      providerCost: 9000,
    });
    await setDoc(doc(db, "paymentProviders", "manual"), {
      code: "manual",
      enabled: true,
    });

    // provisioning jobs (internal)
    await setDoc(doc(db, "provisioningJobs", "job-1"), {
      status: "queued",
      orderId: "order-a",
      createdAt: Date.now(),
    });

    // public catalog
    await setDoc(doc(db, "plans", "plan_starter"), {
      name: "Starter VPS",
      active: true,
      monthlyPrice: 15000,
      displayOrder: 1,
    });
    await setDoc(doc(db, "products", "prod-vps"), { name: "Linux VPS" });
    await setDoc(doc(db, "locations", "loc-dar"), { name: "Dar es Salaam" });
    await setDoc(doc(db, "operatingSystems", "os-ubuntu"), { name: "Ubuntu" });

    // staff metadata
    await setDoc(doc(db, "staff", SUPER_ADMIN), {
      uid: SUPER_ADMIN,
      role: "super_admin",
    });

    // customer profiles / customer metadata
    await setDoc(doc(db, "users", USER_A), {
      uid: USER_A,
      role: "customer",
      email: "a@example.com",
    });
    await setDoc(doc(db, "users", USER_B), {
      uid: USER_B,
      role: "customer",
      email: "b@example.com",
    });
    await setDoc(doc(db, "customers", USER_A), {
      uid: USER_A,
      customerReference: "AF-CUS-A0001",
    });

    // support tickets
    await setDoc(doc(db, "supportTickets", "ticket-a"), {
      customerId: USER_A,
      status: "open",
      subject: "Help",
    });

    // notifications
    await setDoc(doc(db, "notifications", "notif-a"), {
      userId: USER_A,
      type: "payment",
      title: "Payment confirmed",
      read: false,
    });
    await setDoc(doc(db, "notifications", "notif-b"), {
      userId: USER_B,
      type: "payment",
      title: "Payment confirmed",
      read: false,
    });

    // discount codes (internal)
    await setDoc(doc(db, "discountCodes", "code-1"), {
      code: "LAUNCH",
      enabled: true,
    });

    // audit logs (immutable, server-only)
    await setDoc(doc(db, "auditLogs", "log-1"), {
      action: "service_activated",
      actorUid: SUPER_ADMIN,
    });

    // system settings
    await setDoc(doc(db, "systemSettings", "flags"), {
      automaticProvisioning: false,
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

// ---------------------------------------------------------------------------
// Section 70 — the explicitly-required security-rule tests.
// ---------------------------------------------------------------------------
describe("Section 70 required cases", () => {
  it("Customer A cannot read Customer B's orders", async () => {
    await assertFails(getDoc(doc(customer(USER_A), "orders", "order-b")));
  });

  it("Customer cannot modify a paid invoice's status", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "invoices", "inv-a"), {
        status: "refunded",
      }),
    );
  });

  it("Customer cannot change a service to active", async () => {
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
    await assertFails(
      updateDoc(doc(customer(USER_A), "providers", "provider_manual"), {
        providerCost: 1,
      }),
    );
  });

  it("Customer cannot read provider configuration", async () => {
    await assertFails(
      getDoc(doc(customer(USER_A), "providers", "provider_manual")),
    );
  });

  it("Support cannot modify super_admin roles", async () => {
    await assertFails(
      updateDoc(doc(staff(SUPPORT, "support"), "staff", SUPER_ADMIN), {
        role: "support",
      }),
    );
  });

  it("Unauthenticated users cannot access private resources", async () => {
    await assertFails(getDoc(doc(anonymous(), "orders", "order-b")));
    await assertFails(getDoc(doc(anonymous(), "invoices", "inv-a")));
    await assertFails(getDoc(doc(anonymous(), "services", "svc-a")));
    await assertFails(getDoc(doc(anonymous(), "payments", "pay-a")));
    await assertFails(getDoc(doc(anonymous(), "notifications", "notif-a")));
    await assertFails(getDoc(doc(anonymous(), "users", USER_A)));
  });
});

// ---------------------------------------------------------------------------
// Customer ownership isolation (reads).
// ---------------------------------------------------------------------------
describe("Customer ownership isolation", () => {
  it("Customer can read their OWN order/invoice/service/payment", async () => {
    await assertSucceeds(getDoc(doc(customer(USER_A), "orders", "order-a")));
    await assertSucceeds(getDoc(doc(customer(USER_A), "invoices", "inv-a")));
    await assertSucceeds(getDoc(doc(customer(USER_A), "services", "svc-a")));
    await assertSucceeds(getDoc(doc(customer(USER_A), "payments", "pay-a")));
  });

  it("Customer A cannot read Customer B's invoice/service/payment", async () => {
    await assertFails(getDoc(doc(customer(USER_A), "invoices", "inv-b")));
    await assertFails(getDoc(doc(customer(USER_A), "services", "svc-b")));
    // pay-a belongs to A; B must not read it.
    await assertFails(getDoc(doc(customer(USER_B), "payments", "pay-a")));
  });

  it("Customer can read their own ticket but not another's", async () => {
    await assertSucceeds(
      getDoc(doc(customer(USER_A), "supportTickets", "ticket-a")),
    );
    await assertFails(
      getDoc(doc(customer(USER_B), "supportTickets", "ticket-a")),
    );
  });

  it("Customer can read own profile but not another's", async () => {
    await assertSucceeds(getDoc(doc(customer(USER_A), "users", USER_A)));
    await assertFails(getDoc(doc(customer(USER_A), "users", USER_B)));
  });

  it("Customer can read own customer metadata but not another's", async () => {
    await assertSucceeds(getDoc(doc(customer(USER_A), "customers", USER_A)));
    await assertFails(getDoc(doc(customer(USER_B), "customers", USER_A)));
  });
});

// ---------------------------------------------------------------------------
// No client writes to sensitive/server-owned collections.
// ---------------------------------------------------------------------------
describe("Sensitive collections reject ALL client writes", () => {
  it("Customer cannot create/update/delete orders", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "orders", "order-new"), {
        customerId: USER_A,
        status: "paid",
      }),
    );
    await assertFails(
      updateDoc(doc(customer(USER_A), "orders", "order-a"), {
        status: "paid",
      }),
    );
    await assertFails(deleteDoc(doc(customer(USER_A), "orders", "order-a")));
  });

  it("Customer cannot create an invoice or mark one paid", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "invoices", "inv-new"), {
        customerId: USER_A,
        status: "paid",
      }),
    );
    await assertFails(
      updateDoc(doc(customer(USER_A), "invoices", "inv-b"), {
        status: "paid",
      }),
    );
  });

  it("Customer cannot create a payment marked paid", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "payments", "pay-new"), {
        customerId: USER_A,
        status: "paid",
        amount: 1,
      }),
    );
  });

  it("Customer cannot create/activate their own service", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "services", "svc-new"), {
        customerId: USER_A,
        status: "active",
      }),
    );
  });

  it("Customer cannot read or write provisioning jobs", async () => {
    await assertFails(
      getDoc(doc(customer(USER_A), "provisioningJobs", "job-1")),
    );
    await assertFails(
      setDoc(doc(customer(USER_A), "provisioningJobs", "job-new"), {
        status: "completed",
      }),
    );
  });

  it("Customer cannot read or edit audit logs", async () => {
    await assertFails(getDoc(doc(customer(USER_A), "auditLogs", "log-1")));
    await assertFails(
      updateDoc(doc(customer(USER_A), "auditLogs", "log-1"), { action: "x" }),
    );
    await assertFails(
      setDoc(doc(customer(USER_A), "auditLogs", "log-new"), { action: "x" }),
    );
  });

  it("Customer cannot read or write internal config collections", async () => {
    await assertFails(
      getDoc(doc(customer(USER_A), "systemSettings", "flags")),
    );
    await assertFails(
      updateDoc(doc(customer(USER_A), "systemSettings", "flags"), {
        automaticProvisioning: true,
      }),
    );
    await assertFails(
      getDoc(doc(customer(USER_A), "paymentProviders", "manual")),
    );
    await assertFails(getDoc(doc(customer(USER_A), "staff", SUPER_ADMIN)));
    await assertFails(getDoc(doc(customer(USER_A), "discountCodes", "code-1")));
    await assertFails(
      getDoc(doc(customer(USER_A), "providerProducts", "plan_starter")),
    );
  });
});

// ---------------------------------------------------------------------------
// Profile self-service: allowed edits vs. privilege escalation.
// ---------------------------------------------------------------------------
describe("Customer profile self-service", () => {
  it("Customer CAN update non-privileged profile fields", async () => {
    await assertSucceeds(
      updateDoc(doc(customer(USER_A), "users", USER_A), {
        fullName: "Updated Name",
      }),
    );
  });

  it("Customer cannot escalate their own role via update", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "users", USER_A), {
        role: "super_admin",
      }),
    );
  });

  it("Customer cannot rewrite their customerReference/uid", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "users", USER_A), {
        customerReference: "AF-CUS-HACKED",
      }),
    );
  });

  it("Customer can create their OWN profile as role customer", async () => {
    await assertSucceeds(
      setDoc(doc(customer(USER_C), "users", USER_C), {
        uid: USER_C,
        role: "customer",
        email: "c@example.com",
      }),
    );
  });

  it("Customer cannot self-assign a privileged role on create", async () => {
    await assertFails(
      setDoc(doc(customer(USER_C), "users", USER_C), {
        uid: USER_C,
        role: "super_admin",
        email: "c@example.com",
      }),
    );
  });

  it("Customer cannot create someone else's profile", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "users", USER_C), {
        uid: USER_C,
        role: "customer",
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Notifications: owner may only toggle `read`.
// ---------------------------------------------------------------------------
describe("Notifications", () => {
  it("Owner can mark their own notification read", async () => {
    await assertSucceeds(
      updateDoc(doc(customer(USER_A), "notifications", "notif-a"), {
        read: true,
      }),
    );
  });

  it("Owner cannot edit other notification fields", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "notifications", "notif-a"), {
        title: "spoofed",
      }),
    );
  });

  it("Customer cannot read another user's notification", async () => {
    await assertFails(
      getDoc(doc(customer(USER_A), "notifications", "notif-b")),
    );
  });

  it("Customer cannot create or delete notifications", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "notifications", "notif-new"), {
        userId: USER_A,
        read: false,
      }),
    );
    await assertFails(
      deleteDoc(doc(customer(USER_A), "notifications", "notif-a")),
    );
  });
});

// ---------------------------------------------------------------------------
// Support tickets: customer create is hardened.
// ---------------------------------------------------------------------------
describe("Support tickets", () => {
  it("Customer can open their own ticket", async () => {
    await assertSucceeds(
      setDoc(doc(customer(USER_A), "supportTickets", "ticket-new"), {
        customerId: USER_A,
        status: "open",
        subject: "New issue",
      }),
    );
  });

  it("Customer cannot open a ticket for another customer", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "supportTickets", "ticket-spoof"), {
        customerId: USER_B,
        status: "open",
      }),
    );
  });

  it("Customer cannot pre-assign staff or a privileged status", async () => {
    await assertFails(
      setDoc(doc(customer(USER_A), "supportTickets", "ticket-assign"), {
        customerId: USER_A,
        status: "open",
        assignedStaffId: SUPPORT,
      }),
    );
    await assertFails(
      setDoc(doc(customer(USER_A), "supportTickets", "ticket-resolved"), {
        customerId: USER_A,
        status: "resolved",
      }),
    );
  });

  it("Customer cannot update or delete a ticket after creation", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "supportTickets", "ticket-a"), {
        status: "closed",
      }),
    );
    await assertFails(
      deleteDoc(doc(customer(USER_A), "supportTickets", "ticket-a")),
    );
  });
});

// ---------------------------------------------------------------------------
// Staff role boundaries (Section 5).
// ---------------------------------------------------------------------------
describe("Staff role boundaries", () => {
  it("Support can read customer-facing operational data", async () => {
    await assertSucceeds(getDoc(doc(staff(SUPPORT, "support"), "orders", "order-a")));
    await assertSucceeds(getDoc(doc(staff(SUPPORT, "support"), "services", "svc-a")));
    await assertSucceeds(getDoc(doc(staff(SUPPORT, "support"), "customers", USER_A)));
    await assertSucceeds(
      getDoc(doc(staff(SUPPORT, "support"), "supportTickets", "ticket-a")),
    );
    await assertSucceeds(getDoc(doc(staff(SUPPORT, "support"), "users", USER_A)));
  });

  it("Support cannot read payments, provider costs, or audit logs", async () => {
    await assertFails(getDoc(doc(staff(SUPPORT, "support"), "payments", "pay-a")));
    await assertFails(
      getDoc(doc(staff(SUPPORT, "support"), "providers", "provider_manual")),
    );
    await assertFails(getDoc(doc(staff(SUPPORT, "support"), "auditLogs", "log-1")));
    await assertFails(
      getDoc(doc(staff(SUPPORT, "support"), "providerProducts", "plan_starter")),
    );
  });

  it("Finance can read payments but cannot write them", async () => {
    await assertSucceeds(getDoc(doc(staff(FINANCE, "finance"), "payments", "pay-a")));
    await assertFails(
      updateDoc(doc(staff(FINANCE, "finance"), "payments", "pay-a"), {
        status: "refunded",
      }),
    );
  });

  it("Finance cannot read provider configuration/costs", async () => {
    await assertFails(
      getDoc(doc(staff(FINANCE, "finance"), "providers", "provider_manual")),
    );
  });

  it("Admin can read providers and manage the catalog", async () => {
    await assertSucceeds(
      getDoc(doc(staff(ADMIN, "admin"), "providers", "provider_manual")),
    );
    await assertSucceeds(getDoc(doc(staff(ADMIN, "admin"), "payments", "pay-a")));
    await assertSucceeds(getDoc(doc(staff(ADMIN, "admin"), "auditLogs", "log-1")));
    await assertSucceeds(
      updateDoc(doc(staff(ADMIN, "admin"), "plans", "plan_starter"), {
        monthlyPrice: 16000,
      }),
    );
  });

  it("Admin cannot change staff roles or system settings", async () => {
    await assertFails(
      updateDoc(doc(staff(ADMIN, "admin"), "staff", SUPER_ADMIN), {
        role: "admin",
      }),
    );
    await assertFails(
      updateDoc(doc(staff(ADMIN, "admin"), "systemSettings", "flags"), {
        automaticProvisioning: true,
      }),
    );
  });

  it("Neither support nor admin can write audit logs (immutable via client)", async () => {
    await assertFails(
      setDoc(doc(staff(ADMIN, "admin"), "auditLogs", "log-new"), {
        action: "tampered",
      }),
    );
    await assertFails(
      updateDoc(doc(staff(SUPER_ADMIN, "super_admin"), "auditLogs", "log-1"), {
        action: "tampered",
      }),
    );
  });

  it("super_admin can manage staff roles, providers and settings", async () => {
    await assertSucceeds(
      updateDoc(doc(staff(SUPER_ADMIN, "super_admin"), "staff", SUPER_ADMIN), {
        role: "admin",
      }),
    );
    await assertSucceeds(
      updateDoc(
        doc(staff(SUPER_ADMIN, "super_admin"), "providers", "provider_manual"),
        { enabled: true },
      ),
    );
    await assertSucceeds(
      updateDoc(
        doc(staff(SUPER_ADMIN, "super_admin"), "systemSettings", "flags"),
        { automaticProvisioning: true },
      ),
    );
  });

  it("discountCodes: staff read, admin write, support cannot write", async () => {
    await assertSucceeds(
      getDoc(doc(staff(SUPPORT, "support"), "discountCodes", "code-1")),
    );
    await assertSucceeds(
      updateDoc(doc(staff(ADMIN, "admin"), "discountCodes", "code-1"), {
        enabled: false,
      }),
    );
    await assertFails(
      updateDoc(doc(staff(SUPPORT, "support"), "discountCodes", "code-1"), {
        enabled: false,
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Public catalog + default deny.
// ---------------------------------------------------------------------------
describe("Public catalog and default deny", () => {
  it("Public catalog is readable by anyone", async () => {
    await assertSucceeds(getDoc(doc(anonymous(), "plans", "plan_starter")));
    await assertSucceeds(getDoc(doc(anonymous(), "products", "prod-vps")));
    await assertSucceeds(getDoc(doc(anonymous(), "locations", "loc-dar")));
    await assertSucceeds(
      getDoc(doc(anonymous(), "operatingSystems", "os-ubuntu")),
    );
  });

  it("Customers cannot write to the public catalog", async () => {
    await assertFails(
      updateDoc(doc(customer(USER_A), "plans", "plan_starter"), {
        monthlyPrice: 1,
      }),
    );
    await assertFails(
      setDoc(doc(customer(USER_A), "products", "prod-hacked"), { name: "x" }),
    );
  });

  it("Unknown collections are denied for everyone (default deny)", async () => {
    await assertFails(getDoc(doc(customer(USER_A), "secretStuff", "x")));
    await assertFails(
      setDoc(doc(staff(SUPER_ADMIN, "super_admin"), "secretStuff", "x"), {
        a: 1,
      }),
    );
    await assertFails(getDoc(doc(anonymous(), "secretStuff", "x")));
  });
});
