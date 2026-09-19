export type NotificationChannel = "sms" | "whatsapp" | "email" | "push" | "system";
export type NotificationPriority = "critical" | "normal" | "low";
export type NotificationStatus = "queued" | "sent" | "failed" | "delivered" | "unread" | "read";

export type NotificationCategory =
  | "APPOINTMENT_REMINDER"
  | "LAB_RESULT_READY"
  | "PATIENT_ADMISSION"
  | "PATIENT_DISCHARGE"
  | "CLAIM_STATUS_UPDATE"
  | "PAYMENT_REMINDER"
  | "SHIFT_REMINDER"
  | "MEDICATION_REMINDER"
  | "MEDICATION_DUE"
  | "LAB_PANIC"
  | "DISCHARGE_READY"
  | "OT_START"
  | "CLAIM_STATUS"
  | "INVENTORY_ALERT"
  | "PATIENT_REGISTERED"
  | "SHIFT_HANDOVER"
  | "SYSTEM"
  | "BROADCAST"
  | "ESCALATION";

export type BroadcastTarget =
  | "ALL_STAFF"
  | "ALL_DOCTORS"
  | "ALL_NURSES"
  | "ALL_BILLING_STAFF"
  | "DEPARTMENT_BROADCAST"
  | "WARD_BROADCAST";

export interface HmsNotification {
  id: string;
  tenantId: string;
  hospitalId: string;
  patientId?: string;
  patientName?: string;
  recipientUserId?: string; // Canonical recipient user ID
  recipientStaffId?: string; // Canonical staff ID e.g. "EMP-CARD-001"
  recipientRole?: string; // Target role e.g. "DOCTOR", "NURSE", "FINANCE"
  departmentId?: string; // Canonical department ID e.g. "dept-101"
  departmentCode?: string; // Department code e.g. "CARD-01"
  broadcastTarget?: BroadcastTarget; // Target group for broadcasts
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  body: string;
  status: NotificationStatus;
  templateKey?: string; // e.g. "TPL_APPOINTMENT_REMINDER"
  templateVariables?: Record<string, string | number>;
  scheduledFor?: string; // ISO Timestamp for scheduled notification
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  escalationLevel?: number; // 1 = Primary, 2 = Supervisor, 3 = HOD
  escalationTimeoutMinutes?: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface NotificationStoreState {
  notifications: HmsNotification[];
  unreadCount: number;
  isDrawerOpen: boolean;
}

export interface NotificationStoreActions {
  addNotification: (n: Omit<HmsNotification, "id" | "createdAt">) => void;
  updateNotificationStatus: (
    id: string,
    status: NotificationStatus,
    meta?: { deliveredAt?: string; failedAt?: string; failureReason?: string }
  ) => void;
  acknowledgeNotification: (id: string, actorName: string) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  resetToDefaults: () => void;
}

export interface CommunicationLogEntry {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  recipientContact: string; // Phone number or Email address
  recipientName: string;
  templateKey?: string;
  renderedBody: string;
  status: NotificationStatus;
  gatewayResponse?: string;
  sentAt: string;
  deliveredAt?: string;
  failedAt?: string;
  retryCount: number;
}

export interface NotificationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
