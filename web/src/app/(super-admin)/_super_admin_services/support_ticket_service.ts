import { GovernanceEventBus } from "./governance_event_bus";

export interface SupportTicket {
  key: string;
  ticketId: string;
  tenantName: string;
  tenantId: string;
  subject: string;
  category: "BILLING_QUERY" | "PACS_INTEGRATION" | "USER_SEATS_LIMIT" | "ABDM_GATEWAY" | "SYSTEM_BUG";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdDate: string;
  assignedAgent: string;
  conversation: { sender: string; text: string; time: string }[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    key: "1",
    ticketId: "TICK-901",
    tenantName: "Apollo Super Speciality Hospital",
    tenantId: "TNT-9014",
    subject: "Requesting additional user seat allocation for new ICU Nurse Station",
    category: "USER_SEATS_LIMIT",
    priority: "HIGH",
    status: "OPEN",
    createdDate: "2026-09-17 08:30 AM",
    assignedAgent: "Agent Rahul (Tier 2 Support)",
    conversation: [
      { sender: "Apollo Admin", text: "We have reached our 342 user limit and need 20 additional nurse seats for the new ICU wing.", time: "08:30 AM" },
      { sender: "Agent Rahul", text: "Reviewing Enterprise tier capacity. Will escalate to the provisioning team immediately.", time: "09:00 AM" },
    ],
  },
  {
    key: "2",
    ticketId: "TICK-902",
    tenantName: "Fortis Heart & Vascular Institute",
    tenantId: "TNT-1042",
    subject: "ABDM M2 Consent Artifact Push Latency Issue During Peak Hours",
    category: "ABDM_GATEWAY",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    createdDate: "2026-09-17 09:15 AM",
    assignedAgent: "Eng. Sneha (ABDM Gateway Team)",
    conversation: [
      { sender: "Fortis Admin", text: "ABHA consent artifact responses taking > 3 seconds during peak hours. Patients queuing up.", time: "09:15 AM" },
      { sender: "Eng. Sneha", text: "Scaling ABDM gateway workers from 4 to 8 nodes. Investigating Redis cache queue.", time: "09:40 AM" },
      { sender: "Fortis Admin", text: "Latency reduced to 800ms after scale-up. Please monitor for stable resolution.", time: "11:00 AM" },
    ],
  },
  {
    key: "3",
    ticketId: "TICK-903",
    tenantName: "City Diagnostics & OPD Clinic",
    tenantId: "TENANT-003",
    subject: "PACS DICOM Viewer WebGL rendering issue on iOS Safari",
    category: "PACS_INTEGRATION",
    priority: "MEDIUM",
    status: "RESOLVED",
    createdDate: "2026-09-16 02:00 PM",
    assignedAgent: "Agent Rahul (Tier 2 Support)",
    conversation: [
      { sender: "City Diag Admin", text: "DICOM canvas invert button not triggering on iOS 17 Safari. Radiologist cannot view images on tablet.", time: "02:00 PM" },
      { sender: "Agent Rahul", text: "Applied WebGL context fallback patch v2.1.0. Please test.", time: "04:30 PM" },
      { sender: "City Diag Admin", text: "Issue resolved. Thank you!", time: "05:00 PM" },
    ],
  },
  {
    key: "4",
    ticketId: "TICK-904",
    tenantName: "Max Super Speciality Hospital",
    tenantId: "TNT-2088",
    subject: "CDSS AI Clinical Assist module blank screen for ICU doctors",
    category: "SYSTEM_BUG",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdDate: "2026-09-18 07:00 AM",
    assignedAgent: "Eng. Priya (AI Platform Team)",
    conversation: [
      { sender: "Max Admin", text: "CDSS AI Assist shows blank screen for all ICU doctors. OPD doctors are unaffected.", time: "07:00 AM" },
      { sender: "Eng. Priya", text: "Found scoping permission mismatch for ICU context in CDSS model endpoint. Fix being deployed.", time: "07:45 AM" },
    ],
  },
  {
    key: "5",
    ticketId: "TICK-905",
    tenantName: "Manipal Hospital Whitefield",
    tenantId: "TNT-3105",
    subject: "NABH accreditation certificate upload failing — compliance deadline approaching",
    category: "BILLING_QUERY",
    priority: "CRITICAL",
    status: "OPEN",
    createdDate: "2026-09-18 10:30 AM",
    assignedAgent: "Unassigned",
    conversation: [
      { sender: "Manipal Admin", text: "NABH renewal certificate upload keeps failing with HTTP 413. Compliance deadline is 2026-09-25. Urgent!", time: "10:30 AM" },
    ],
  },
  {
    key: "6",
    ticketId: "TICK-906",
    tenantName: "Narayana Health City",
    tenantId: "TNT-4412",
    subject: "Activate PACS DICOM Viewer for new Radiology Department",
    category: "PACS_INTEGRATION",
    priority: "MEDIUM",
    status: "OPEN",
    createdDate: "2026-09-17 03:00 PM",
    assignedAgent: "Agent Rahul (Tier 2 Support)",
    conversation: [
      { sender: "Narayana Admin", text: "New radiology dept launches next week. Need PACS DICOM viewer activated under our Enterprise plan.", time: "03:00 PM" },
      { sender: "Agent Rahul", text: "PACS is included in your Enterprise tier. Escalating to feature provisioning.", time: "03:30 PM" },
    ],
  },
  {
    key: "7",
    ticketId: "TICK-907",
    tenantName: "Sir Ganga Ram Hospital",
    tenantId: "TNT-5611",
    subject: "Account reactivation request after compliance suspension",
    category: "BILLING_QUERY",
    priority: "HIGH",
    status: "OPEN",
    createdDate: "2026-09-18 12:00 PM",
    assignedAgent: "Eng. Sneha (ABDM Gateway Team)",
    conversation: [
      { sender: "SGRH Legal", text: "NABH certificate renewed (cert no: NABH-2026-5611-RENEW). Requesting immediate account reactivation.", time: "12:00 PM" },
      { sender: "Agent Rahul", text: "Certificate received. Forwarded to compliance team for verification. ETA: 24 hours.", time: "12:30 PM" },
    ],
  },
];

let ticketsStore: SupportTicket[] = [...INITIAL_TICKETS];
const listeners: (() => void)[] = [];

export class SupportTicketService {
  public static getTickets(): SupportTicket[] {
    return [...ticketsStore];
  }

  public static createTicket(ticket: Omit<SupportTicket, "key" | "ticketId" | "createdDate" | "status" | "conversation"> & { initialMessage: string }): SupportTicket {
    const newId = `TICK-${Math.floor(900 + Math.random() * 100)}`;
    const newTicket: SupportTicket = {
      key: newId,
      ticketId: newId,
      tenantName: ticket.tenantName,
      tenantId: ticket.tenantId,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: "OPEN",
      createdDate: new Date().toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" }),
      assignedAgent: ticket.assignedAgent || "Unassigned",
      conversation: [{ sender: ticket.tenantName, text: ticket.initialMessage, time: "Just now" }],
    };

    ticketsStore = [newTicket, ...ticketsStore];

    GovernanceEventBus.emit({
      eventType: "SUPPORT_TICKET_UPDATED",
      tenantId: ticket.tenantId,
      tenantName: ticket.tenantName,
      actor: "Super Admin Ops",
      actorRole: "SUPER_ADMIN",
      action: "Created Support Ticket",
      details: { ticketId: newId, subject: ticket.subject, category: ticket.category, priority: ticket.priority },
      riskLevel: ticket.priority === "CRITICAL" ? "CRITICAL" : "INFO",
    });

    listeners.forEach((l) => l());
    return newTicket;
  }

  public static updateTicketStatus(ticketId: string, status: SupportTicket["status"]): void {
    const target = ticketsStore.find((t) => t.ticketId === ticketId);
    ticketsStore = ticketsStore.map((t) => (t.ticketId === ticketId ? { ...t, status } : t));

    if (target) {
      GovernanceEventBus.emit({
        eventType: "SUPPORT_TICKET_UPDATED",
        tenantId: target.tenantId,
        tenantName: target.tenantName,
        actor: "Super Admin Ops",
        actorRole: "SUPER_ADMIN",
        action: `Updated Ticket Status to ${status}`,
        details: { ticketId, newStatus: status, subject: target.subject },
        riskLevel: "INFO",
      });
    }

    listeners.forEach((l) => l());
  }

  public static addReply(ticketId: string, sender: string, text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const target = ticketsStore.find((t) => t.ticketId === ticketId);
    ticketsStore = ticketsStore.map((t) =>
      t.ticketId === ticketId ? { ...t, conversation: [...t.conversation, { sender, text, time }] } : t
    );

    if (target) {
      GovernanceEventBus.emit({
        eventType: "SUPPORT_TICKET_UPDATED",
        tenantId: target.tenantId,
        tenantName: target.tenantName,
        actor: sender,
        actorRole: "SUPER_ADMIN",
        action: "Added Ticket Reply",
        details: { ticketId, replySnippet: text.substring(0, 50) },
        riskLevel: "INFO",
      });
    }

    listeners.forEach((l) => l());
  }

  public static subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }
}
