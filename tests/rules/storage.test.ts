import { readFileSync } from "node:fs";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getBytes, ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "demo-afrivps";

const USER_A = "customer-a";
const USER_B = "customer-b";
const SUPPORT = "support-user";

let testEnv: RulesTestEnvironment;

// Small, valid payloads.
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
const IMG_META = { contentType: "image/png" } as const;

// Resolve the emulator address from the standard env var injected by
// `firebase emulators:exec` (FIREBASE_STORAGE_EMULATOR_HOST=host:port), falling
// back to the firebase.json default so `pnpm test:rules` works unchanged.
function emulatorAddress(envVar: string, fallbackPort: number) {
  const raw = process.env[envVar];
  if (raw) {
    const [host, port] = raw.split(":");
    return { host, port: Number(port) };
  }
  return { host: "127.0.0.1", port: fallbackPort };
}

beforeAll(async () => {
  const { host, port } = emulatorAddress("FIREBASE_STORAGE_EMULATOR_HOST", 9199);
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      rules: readFileSync("storage.rules", "utf8"),
      host,
      port,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();

  // Seed files as a trusted server (rules disabled).
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const storage = ctx.storage();
    await uploadBytes(
      ref(storage, `support/${USER_A}/ticket-a/note.png`),
      PNG,
      IMG_META,
    );
    await uploadBytes(
      ref(storage, `users/${USER_A}/avatar.png`),
      PNG,
      IMG_META,
    );
    await uploadBytes(
      ref(storage, `invoices/${USER_A}/AFV-2026-000001.pdf`),
      PNG,
      { contentType: "application/pdf" },
    );
  });
});

function customer(uid: string) {
  return testEnv.authenticatedContext(uid, { email_verified: true }).storage();
}
function staff(uid: string, role: string) {
  return testEnv.authenticatedContext(uid, { role }).storage();
}
function anonymous() {
  return testEnv.unauthenticatedContext().storage();
}

describe("Storage rules — support attachments", () => {
  it("Customer can read and write their own attachment", async () => {
    await assertSucceeds(
      getBytes(ref(customer(USER_A), `support/${USER_A}/ticket-a/note.png`)),
    );
    await assertSucceeds(
      uploadBytes(
        ref(customer(USER_A), `support/${USER_A}/ticket-a/new.png`),
        PNG,
        IMG_META,
      ),
    );
  });

  it("Customer A cannot read Customer B's attachment", async () => {
    await assertFails(
      getBytes(ref(customer(USER_B), `support/${USER_A}/ticket-a/note.png`)),
    );
  });

  it("Customer A cannot write into Customer B's attachment path", async () => {
    await assertFails(
      uploadBytes(
        ref(customer(USER_A), `support/${USER_B}/ticket-x/evil.png`),
        PNG,
        IMG_META,
      ),
    );
  });

  it("Staff can read any customer's attachment", async () => {
    await assertSucceeds(
      getBytes(
        ref(staff(SUPPORT, "support"), `support/${USER_A}/ticket-a/note.png`),
      ),
    );
  });

  it("Rejects disallowed (executable) content types", async () => {
    await assertFails(
      uploadBytes(
        ref(customer(USER_A), `support/${USER_A}/ticket-a/malware.exe`),
        PNG,
        { contentType: "application/x-msdownload" },
      ),
    );
  });

  it("Unauthenticated users cannot read or write attachments", async () => {
    await assertFails(
      getBytes(ref(anonymous(), `support/${USER_A}/ticket-a/note.png`)),
    );
    await assertFails(
      uploadBytes(
        ref(anonymous(), `support/${USER_A}/ticket-a/anon.png`),
        PNG,
        IMG_META,
      ),
    );
  });
});

describe("Storage rules — profile assets", () => {
  it("Customer can upload their own profile image", async () => {
    await assertSucceeds(
      uploadBytes(ref(customer(USER_A), `users/${USER_A}/avatar2.png`), PNG, IMG_META),
    );
  });

  it("Customer cannot upload a non-image profile asset", async () => {
    await assertFails(
      uploadBytes(ref(customer(USER_A), `users/${USER_A}/doc.pdf`), PNG, {
        contentType: "application/pdf",
      }),
    );
  });

  it("Customer cannot upload an oversized profile image (>5MB)", async () => {
    const big = new Uint8Array(6 * 1024 * 1024);
    await assertFails(
      uploadBytes(ref(customer(USER_A), `users/${USER_A}/huge.png`), big, IMG_META),
    );
  });

  it("Customer A cannot write into Customer B's profile path", async () => {
    await assertFails(
      uploadBytes(ref(customer(USER_A), `users/${USER_B}/avatar.png`), PNG, IMG_META),
    );
  });
});

describe("Storage rules — invoice files", () => {
  it("Owner can read their invoice file", async () => {
    await assertSucceeds(
      getBytes(ref(customer(USER_A), `invoices/${USER_A}/AFV-2026-000001.pdf`)),
    );
  });

  it("Another customer cannot read someone else's invoice file", async () => {
    await assertFails(
      getBytes(ref(customer(USER_B), `invoices/${USER_A}/AFV-2026-000001.pdf`)),
    );
  });

  it("Customers cannot write invoice files (server-generated only)", async () => {
    await assertFails(
      uploadBytes(
        ref(customer(USER_A), `invoices/${USER_A}/forged.pdf`),
        PNG,
        { contentType: "application/pdf" },
      ),
    );
  });
});

describe("Storage rules — default deny", () => {
  it("Unknown paths are denied for everyone", async () => {
    await assertFails(getBytes(ref(customer(USER_A), `random/secret.txt`)));
    await assertFails(
      uploadBytes(ref(customer(USER_A), `random/secret.txt`), PNG, {
        contentType: "text/plain",
      }),
    );
  });
});
