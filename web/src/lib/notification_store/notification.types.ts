export type NotificationChannel = "sms" | "whatsapp" | "email" | "push" | "system";
export type NotificationPriority = "critical" | "normal" | "low";
export type NotificationStatus = "queued" | "sent" | "failed" | "delivered" | "unread" | "read";

export type NotificationCategory =
  | "LAB_PANIC"
  | "MEDICATION_DUE"
  | "APPOINTMENT_REMINDER"
  | "DISCHARGE_READY"
  | "OT_START"
  | "CLAIM_STATUS"
  | "INVENTORY_ALERT"
  | "PATIENT_REGISTERED"
  | "SHIFT_HANDOVER"
  | "SYSTEM";

export interface HmsNotification {
  id: string;
  tenantId: string;
  hospitalId: string;
  patientId?: string;
  patientName?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  body: string;
  status: NotificationStatus;
  templateKey?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStoreState {
  notifications: HmsNotification[];
  unreadCount: number;
  isDrawerOpen: boolean;
}

export interface NotificationStoreActions {
  addNotification: (n: Omit<HmsNotification, "id" | "createdAt" | "status">) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}
