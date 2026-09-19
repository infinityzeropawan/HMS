"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CommunicationLogEntry, NotificationChannel, NotificationStatus } from "@/lib/notification_store/notification.types";

interface CommunicationStoreState {
  logs: CommunicationLogEntry[];
  addLog: (log: Omit<CommunicationLogEntry, "id" | "sentAt" | "retryCount">) => void;
  updateLogStatus: (id: string, status: NotificationStatus, gatewayResponse?: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_LOGS: CommunicationLogEntry[] = [
  {
    id: "log-101",
    notificationId: "n-003",
    channel: "sms",
    recipientContact: "+91 98765 43210",
    recipientName: "Arjun Mehta",
    templateKey: "TPL_APPOINTMENT_REMINDER",
    renderedBody: "Dear Arjun Mehta, your OPD appointment with Dr. Nair is confirmed for 11:00 AM.",
    status: "delivered",
    gatewayResponse: "SMS Gateway 200 OK — MsgID #SMS-88912",
    sentAt: new Date(Date.now() - 35 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 34 * 60000).toISOString(),
    retryCount: 0,
  },
  {
    id: "log-102",
    notificationId: "n-006",
    channel: "whatsapp",
    recipientContact: "+91 91234 56789",
    recipientName: "Deepak Singh",
    templateKey: "TPL_APPOINTMENT_REMINDER",
    renderedBody: "Hello Deepak Singh, this is a reminder for your follow-up consultation with Cardiology tomorrow.",
    status: "delivered",
    gatewayResponse: "WhatsApp API 200 OK — MsgID #WA-44129",
    sentAt: new Date(Date.now() - 150 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 149 * 60000).toISOString(),
    retryCount: 0,
  },
  {
    id: "log-103",
    notificationId: "n-001",
    channel: "system",
    recipientContact: "EMP-CARD-01 (Internal Console)",
    recipientName: "Dr. Rajesh Sharma",
    templateKey: "TPL_LAB_RESULT_READY",
    renderedBody: "Critical Lab Value — Hb 5.8 g/dL for Patient Ramesh Kumar.",
    status: "unread",
    gatewayResponse: "In-App WebSocket Alert Emitted",
    sentAt: new Date(Date.now() - 2 * 60000).toISOString(),
    retryCount: 0,
  },
];

export const useCommunicationStore = create<CommunicationStoreState>()(
  persist(
    (set) => ({
      logs: DEFAULT_LOGS,

      addLog: (log) =>
        set((state) => ({
          logs: [
            {
              ...log,
              id: `log-${Date.now()}`,
              sentAt: new Date().toISOString(),
              retryCount: 0,
            },
            ...state.logs,
          ],
        })),

      updateLogStatus: (id, status, gatewayResponse) =>
        set((state) => ({
          logs: state.logs.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status,
                  gatewayResponse: gatewayResponse || l.gatewayResponse,
                  deliveredAt: status === "delivered" ? new Date().toISOString() : l.deliveredAt,
                  failedAt: status === "failed" ? new Date().toISOString() : l.failedAt,
                }
              : l
          ),
        })),

      resetToDefaults: () => set({ logs: DEFAULT_LOGS }),
    }),
    {
      name: "hms_communication_log_store",
    }
  )
);
