import type { TicketStatus } from "@/types";
import { ServiceNotImplementedError } from "./errors";
import type {
  SupportTicket,
  TicketDepartment,
  TicketMessage,
} from "./types";

/**
 * SupportService (Sections 36, 37, 65).
 *
 * Owns support tickets and their messages. Customers can only access their own
 * tickets (enforced by Firestore rules); attachments are validated for type,
 * size, ownership, and authorization before storage (Section 37).
 *
 * Phase 1: typed contract + stub. Ticketing lands in Phase 4.
 */

export interface CreateTicketInput {
  customerId: string;
  department: TicketDepartment;
  subject: string;
  priority: SupportTicket["priority"];
  serviceId?: string;
  message: string;
}

export interface AddTicketMessageInput {
  ticketId: string;
  authorUid: string;
  authorRole: "customer" | "staff";
  body: string;
  attachmentPaths?: string[];
}

export interface SupportService {
  createTicket(input: CreateTicketInput): Promise<SupportTicket>;
  addMessage(input: AddTicketMessageInput): Promise<TicketMessage>;
  transition(ticketId: string, next: TicketStatus): Promise<SupportTicket>;
  listCustomerTickets(customerId: string): Promise<SupportTicket[]>;
}

const SERVICE = "SupportService";

export class Phase1SupportService implements SupportService {
  async createTicket(): Promise<SupportTicket> {
    throw new ServiceNotImplementedError(SERVICE, "createTicket", "Phase 4");
  }
  async addMessage(): Promise<TicketMessage> {
    throw new ServiceNotImplementedError(SERVICE, "addMessage", "Phase 4");
  }
  async transition(): Promise<SupportTicket> {
    throw new ServiceNotImplementedError(SERVICE, "transition", "Phase 4");
  }
  async listCustomerTickets(): Promise<SupportTicket[]> {
    throw new ServiceNotImplementedError(
      SERVICE,
      "listCustomerTickets",
      "Phase 4",
    );
  }
}
