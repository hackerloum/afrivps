import { ServiceNotImplementedError } from "./errors";
import type { Notification } from "./types";

/**
 * NotificationService (Section 38, 65).
 *
 * Creates in-app notifications. Notifications MUST never contain passwords,
 * server credentials, or infrastructure secrets (Section 38) — only safe,
 * human-readable messages and an optional in-app link.
 *
 * Phase 1: typed contract + stub. Delivery lands in Phase 4.
 */

export interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface NotificationService {
  notify(input: NotifyInput): Promise<Notification>;
  markRead(notificationId: string): Promise<void>;
  listForUser(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
}

const SERVICE = "NotificationService";

export class Phase1NotificationService implements NotificationService {
  async notify(): Promise<Notification> {
    throw new ServiceNotImplementedError(SERVICE, "notify", "Phase 4");
  }
  async markRead(): Promise<void> {
    throw new ServiceNotImplementedError(SERVICE, "markRead", "Phase 4");
  }
  async listForUser(): Promise<Notification[]> {
    throw new ServiceNotImplementedError(SERVICE, "listForUser", "Phase 4");
  }
}
