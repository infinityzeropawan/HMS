"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  HmsNotification,
  NotificationStoreActions,
  NotificationStoreState,
  NotificationStatus,
} from "./notification.types";

const SEED_NOTIFICATIONS: HmsNotification[] = [
  {
    id: "n-001",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-001",
    patientName: "Ramesh Kumar",
    recipientUserId: "usr-doc-101",
    recipientStaffId: "EMP-CARD-01",
    recipientRole: "DOCTOR",
    departmentId: "dept-101",
    departmentCode: "CARD-01",
    channel: "system",
    priority: "critical",
    category: "LAB_PANIC",
    title: "Critical Lab Value — Hb 5.8 g/dL",
    body: "Patient Ramesh Kumar has a critically low haemoglobin. Immediate review required.",
    status: "unread",
    templateKey: "TPL_LAB_RESULT_READY",
    escalationLevel: 1,
    escalationTimeoutMinutes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n-002",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-002",
    patientName: "Priya Sharma",
    recipientUserId: "usr-nurse-202",
    recipientStaffId: "EMP-NURS-02",
    recipientRole: "NURSE",
    departmentId: "dept-103",
    departmentCode: "ICU-CCU",
    channel: "system",
    priority: "normal",
    category: "MEDICATION_REMINDER",
    title: "MAR Due — Ward B, Bed 12",
    body: "Amoxicillin 500mg dose due in 10 minutes for Priya Sharma.",
    status: "unread",
    templateKey: "TPL_MEDICATION_REMINDER",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
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
    templateKey: "TPL_APPOINTMENT_REMINDER",
    sentAt: new Date(Date.now() - 35 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 34 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
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
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "n-005",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-005",
    patientName: "Sunita Patel",
    channel: "system",
    priority: "normal",
    category: "PATIENT_DISCHARGE",
    title: "Discharge Summary Signed — Bed 7",
    body: "Dr. Verma has signed the discharge summary for IPD patient Sunita Patel.",
    status: "read",
    templateKey: "TPL_PATIENT_DISCHARGE",
    readAt: new Date(Date.now() - 90 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
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
    status: "delivered",
    templateKey: "TPL_APPOINTMENT_REMINDER",
    sentAt: new Date(Date.now() - 150 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 149 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 60000).toISOString(),
  },
  {
    id: "n-007",
    tenantId: "t-001",
    hospitalId: "h-001",
    patientId: "p-007",
    patientName: "Kavita Rao",
    channel: "system",
    priority: "critical",
    category: "OT_START",
    title: "OT-2 Starting in 15 mins",
    body: "Appendectomy for patient Kavita Rao is scheduled in OT-2 at 14:00. Pre-op checklist pending.",
    status: "unread",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: "n-008",
    tenantId: "t-001",
    hospitalId: "h-001",
    channel: "system",
    priority: "normal",
    category: "CLAIM_STATUS_UPDATE",
    title: "TPA Query Raised — Claim #TPA-2024-0891",
    body: "Star Health Insurance raised a query on claim #TPA-2024-0891. Documents required within 48 hours.",
    status: "unread",
    templateKey: "TPL_CLAIM_STATUS_UPDATE",
    createdAt: new Date(Date.now() - 210 * 60000).toISOString(),
  },
];

type NotificationStore = NotificationStoreState & NotificationStoreActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: SEED_NOTIFICATIONS,
      unreadCount: SEED_NOTIFICATIONS.filter((n) => n.status === "unread").length,
      isDrawerOpen: false,

      addNotification: (partial) => {
        const n: HmsNotification = {
          ...partial,
          id: `n-${Date.now()}`,
          status: partial.status || "unread",
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const updated = [n, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((item) => item.status === "unread").length,
          };
        });
      },

      updateNotificationStatus: (id, status, meta) => {
        set((state) => {
          const updated = state.notifications.map((n) => {
            if (n.id !== id) return n;
            return {
              ...n,
              status,
              sentAt: status === "sent" ? new Date().toISOString() : n.sentAt,
              deliveredAt: meta?.deliveredAt || (status === "delivered" ? new Date().toISOString() : n.deliveredAt),
              failedAt: meta?.failedAt || (status === "failed" ? new Date().toISOString() : n.failedAt),
              failureReason: meta?.failureReason || n.failureReason,
            };
          });
          return {
            notifications: updated,
            unreadCount: updated.filter((item) => item.status === "unread").length,
          };
        });
      },

      acknowledgeNotification: (id, actorName) => {
        set((state) => {
          const updated = state.notifications.map((n) => {
            if (n.id !== id) return n;
            return {
              ...n,
              status: "read" as NotificationStatus,
              readAt: new Date().toISOString(),
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: actorName,
            };
          });
          return {
            notifications: updated,
            unreadCount: updated.filter((item) => item.status === "unread").length,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, status: "read" as NotificationStatus, readAt: new Date().toISOString() } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((item) => item.status === "unread").length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.status === "unread"
              ? { ...n, status: "read" as NotificationStatus, readAt: new Date().toISOString() }
              : n
          ),
          unreadCount: 0,
        }));
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      resetToDefaults: () =>
        set({
          notifications: SEED_NOTIFICATIONS,
          unreadCount: SEED_NOTIFICATIONS.filter((n) => n.status === "unread").length,
          isDrawerOpen: false,
        }),
    }),
    {
      name: "hms_notification_center_store",
    }
  )
);
