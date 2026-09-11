"use client";
import { create } from "zustand";
import type {
  HmsNotification,
  NotificationStoreActions,
  NotificationStoreState,
} from "./notification.types";

const SEED_NOTIFICATIONS: HmsNotification[] = [
  {
    id: "n-001",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-001",
    patientName: "Ramesh Kumar",
    channel: "system",
    priority: "critical",
    category: "LAB_PANIC",
    title: "Critical Lab Value — Hb 5.8 g/dL",
    body: "Patient Ramesh Kumar has a critically low haemoglobin. Immediate review required.",
    status: "unread",
    createdAt: '2026-09-11T23:55:00.000Z',
  },
  {
    id: "n-002",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-002",
    patientName: "Priya Sharma",
    channel: "system",
    priority: "normal",
    category: "MEDICATION_DUE",
    title: "MAR Due — Ward B, Bed 12",
    body: "Amoxicillin 500mg dose due in 10 minutes for Priya Sharma.",
    status: "unread",
    createdAt: '2026-09-11T23:50:00.000Z',
  },
  {
    id: "n-003",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-003",
    patientName: "Arjun Mehta",
    channel: "sms",
    priority: "normal",
    category: "APPOINTMENT_REMINDER",
    title: "Appointment Confirmed — Dr. Nair",
    body: "SMS sent to Arjun Mehta confirming OPD appointment at 11:00 AM.",
    status: "delivered",
    sentAt: '2026-09-11T23:30:00.000Z',
    createdAt: '2026-09-11T23:30:00.000Z',
  },
  {
    id: "n-004",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "INVENTORY_ALERT",
    title: "Reorder Alert — Metformin 500mg",
    body: "Stock level below reorder threshold (12 strips remaining). Raise PO immediately.",
    status: "unread",
    createdAt: '2026-09-11T23:15:00.000Z',
  },
  {
    id: "n-005",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "DISCHARGE_READY",
    title: "Discharge Summary — Bed 7, Ward A",
    body: "Dr. Verma has signed the discharge summary for IPD patient Sunita Patel.",
    status: "read",
    readAt: '2026-09-11T23:00:00.000Z',
    createdAt: '2026-09-11T22:30:00.000Z',
  },
  {
    id: "n-006",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "whatsapp",
    priority: "low",
    category: "APPOINTMENT_REMINDER",
    title: "WhatsApp Reminder Sent",
    body: "Appointment reminder sent via WhatsApp to Deepak Singh for tomorrow's follow-up.",
    status: "sent",
    sentAt: '2026-09-11T22:00:00.000Z',
    createdAt: '2026-09-11T22:00:00.000Z',
  },
  {
    id: "n-007",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "critical",
    category: "OT_START",
    title: "OT-2 Starting in 15 mins",
    body: "Appendectomy for patient Kavita Rao is scheduled in OT-2 at 14:00. Pre-op checklist pending.",
    status: "unread",
    createdAt: '2026-09-11T23:55:00.000Z',
  },
  {
    id: "n-008",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "CLAIM_STATUS",
    title: "TPA Query Raised — Claim #TPA-2024-0891",
    body: "Star Health Insurance raised a query on claim #TPA-2024-0891. Documents required within 48 hours.",
    status: "unread",
    createdAt: '2026-09-11T23:40:00.000Z',
  },
];

type NotificationStore = NotificationStoreState & NotificationStoreActions;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: SEED_NOTIFICATIONS,
  unreadCount: SEED_NOTIFICATIONS.filter((n) => n.status === "unread").length,
  isDrawerOpen: false,

  addNotification: (partial) => {
    const n: HmsNotification = {
      ...partial,
      id: `n-${Date.now()}`,
      status: "unread",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(
        0,
        state.notifications.filter((n) => n.status === "unread" && n.id !== id).length
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.status === "unread" ? { ...n, status: "read", readAt: new Date().toISOString() } : n
      ),
      unreadCount: 0,
    }));
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));
