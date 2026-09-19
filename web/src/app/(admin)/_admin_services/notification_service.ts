"use client";

import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { CommunicationService } from "./communication_service";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";
import {
  HmsNotification,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  BroadcastTarget,
  NotificationValidationResult,
} from "@/lib/notification_store/notification.types";

export interface SendNotificationInput {
  patientId?: string;
  patientName?: string;
  recipientUserId?: string;
  recipientStaffId?: string;
  recipientRole?: string;
  recipientContact?: string;
  departmentId?: string;
  departmentCode?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: NotificationCategory;
  templateKey?: string;
  templateVariables?: Record<string, string | number>;
  customTitle?: string;
  customBody?: string;
  scheduledFor?: string;
  escalationTimeoutMinutes?: number;
}

export interface SendBroadcastInput {
  target: BroadcastTarget;
  departmentId?: string;
  departmentCode?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  body: string;
}

export class NotificationService {
  /**
   * Retrieves all hospital notifications.
   */
  public static getNotifications(): HmsNotification[] {
    return useNotificationStore.getState().notifications;
  }

  /**
   * Retrieves unread notifications.
   */
  public static getUnreadNotifications(): HmsNotification[] {
    return useNotificationStore.getState().notifications.filter((n) => n.status === "unread");
  }

  /**
   * Sends a targeted notification with template interpolation, channel dispatching, and audit logging.
   */
  public static sendNotification(
    input: SendNotificationInput,
    actorName = "Hospital Communication System",
    actorRole = "SYSTEM"
  ): { success: boolean; notificationId: string; message: string } {
    let title = input.customTitle || "Hospital System Alert";
    let body = input.customBody || "New update received.";

    if (input.templateKey) {
      const interpolated = CommunicationService.interpolateTemplate(
        input.templateKey,
        input.templateVariables
      );
      title = interpolated.title;
      body = interpolated.body;
    }

    const notificationId = `n-${Date.now()}`;

    // Dispatch through gateway
    const dispatchResult = CommunicationService.dispatchChannelMessage(
      notificationId,
      input.channel,
      input.recipientContact || input.patientName || "Internal System",
      input.recipientUserId || input.patientName || "Hospital Staff",
      title,
      body,
      input.templateKey
    );

    // Save into Notification Center Store
    useNotificationStore.getState().addNotification({
      tenantId: "t-001",
      hospitalId: "h-001",
      patientId: input.patientId,
      patientName: input.patientName,
      recipientUserId: input.recipientUserId,
      recipientStaffId: input.recipientStaffId,
      recipientRole: input.recipientRole,
      departmentId: input.departmentId,
      departmentCode: input.departmentCode,
      channel: input.channel,
      priority: input.priority,
      category: input.category,
      title,
      body,
      status: dispatchResult.status,
      templateKey: input.templateKey,
      templateVariables: input.templateVariables,
      scheduledFor: input.scheduledFor,
      sentAt: dispatchResult.success ? new Date().toISOString() : undefined,
      deliveredAt: dispatchResult.status === "delivered" ? new Date().toISOString() : undefined,
      failedAt: !dispatchResult.success ? new Date().toISOString() : undefined,
      failureReason: !dispatchResult.success ? dispatchResult.responseMessage : undefined,
      escalationLevel: input.priority === "critical" ? 1 : undefined,
      escalationTimeoutMinutes: input.escalationTimeoutMinutes || (input.priority === "critical" ? 15 : undefined),
    });

    // Audit Logging
    const auditAction = dispatchResult.success ? "Notification Sent" : "Notification Failed";
    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: auditAction,
      category: "COMPLIANCE_EVENT",
      entity: `Notification: ${input.category} [${input.channel.toUpperCase()}]`,
      ipAddress: "192.168.1.105",
      riskLevel: input.priority === "critical" ? "CRITICAL" : "INFO",
      details: `Dispatched notification to recipient [${input.recipientUserId || input.recipientRole || input.patientName || "Staff"}]. Result: ${dispatchResult.responseMessage}`,
    });

    return {
      success: dispatchResult.success,
      notificationId,
      message: dispatchResult.responseMessage,
    };
  }

  /**
   * Dispatches a broadcast alert to targeted staff groups or departments.
   */
  public static sendBroadcast(
    input: SendBroadcastInput,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string } {
    const notificationId = `bcast-${Date.now()}`;

    useNotificationStore.getState().addNotification({
      tenantId: "t-001",
      hospitalId: "h-001",
      broadcastTarget: input.target,
      departmentId: input.departmentId,
      departmentCode: input.departmentCode,
      channel: input.channel,
      priority: input.priority,
      category: "BROADCAST",
      title: `[BROADCAST: ${input.target}] ${input.title}`,
      body: input.body,
      status: "unread",
      sentAt: new Date().toISOString(),
    });

    // Audit Log
    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: "Broadcast Sent",
      category: "GOVERNANCE_EVENT",
      entity: `Broadcast Target: ${input.target}`,
      ipAddress: "192.168.1.105",
      riskLevel: "WARNING",
      details: `Broadcast alert [${input.title}] sent to target group ${input.target} by ${actorName}`,
    });

    return {
      success: true,
      message: `Broadcast message transmitted successfully to target group: ${input.target}`,
    };
  }

  /**
   * Triggers an emergency escalation workflow for unacknowledged critical alerts.
   */
  public static triggerEscalation(
    notificationId: string,
    actorName = "Automated Escalation Service",
    actorRole = "SYSTEM"
  ): { success: boolean; newLevel: number; message: string } {
    const notification = useNotificationStore.getState().notifications.find((n) => n.id === notificationId);
    if (!notification) {
      return { success: false, newLevel: 0, message: "Notification not found." };
    }

    const currentLevel = notification.escalationLevel || 1;
    const nextLevel = currentLevel + 1;
    const nextRole = nextLevel === 2 ? "DUTY_DOCTOR" : "DEPARTMENT_HOD";

    useNotificationStore.getState().addNotification({
      tenantId: notification.tenantId,
      hospitalId: notification.hospitalId,
      patientId: notification.patientId,
      patientName: notification.patientName,
      recipientRole: nextRole,
      departmentId: notification.departmentId,
      departmentCode: notification.departmentCode,
      channel: "system",
      priority: "critical",
      category: "ESCALATION",
      title: `[ESCALATION L${nextLevel}] Unacknowledged Alert: ${notification.title}`,
      body: `CRITICAL ALERT ESCALATION: Original alert unacknowledged for ${notification.escalationTimeoutMinutes || 15} mins. Re-assigned to ${nextRole}. Original detail: ${notification.body}`,
      status: "unread",
      escalationLevel: nextLevel,
      escalationTimeoutMinutes: notification.escalationTimeoutMinutes,
    });

    // Audit Log
    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: actorRole,
      action: "Escalation Triggered",
      category: "GOVERNANCE_EVENT",
      entity: `Notification Escalation L${nextLevel}: ${notification.title}`,
      ipAddress: "192.168.1.105",
      riskLevel: "CRITICAL",
      details: `Unacknowledged alert [${notification.id}] escalated to Level ${nextLevel} (${nextRole}).`,
    });

    return {
      success: true,
      newLevel: nextLevel,
      message: `Critical alert escalated to Level ${nextLevel} (${nextRole}).`,
    };
  }

  /**
   * Marks a notification as read and records an audit event.
   */
  public static markAsRead(notificationId: string, actorName = "User"): void {
    const notification = useNotificationStore.getState().notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    useNotificationStore.getState().markAsRead(notificationId);

    PlatformAuditService.recordAuditEvent({
      actor: actorName,
      actorRole: "STAFF",
      action: "Notification Read",
      category: "COMPLIANCE_EVENT",
      entity: `Notification: ${notification.title}`,
      ipAddress: "192.168.1.105",
      riskLevel: "INFO",
      details: `Notification [${notification.id}] marked as read by ${actorName}`,
    });
  }

  /**
   * Acknowledges a critical alert.
   */
  public static acknowledgeAlert(notificationId: string, actorName: string): void {
    useNotificationStore.getState().acknowledgeNotification(notificationId, actorName);
  }

  /**
   * Notification Architecture Integrity Validation Report.
   */
  public static validateNotificationIntegrity(): NotificationValidationResult {
    const notifications = this.getNotifications();
    const errors: string[] = [];
    const warnings: string[] = [];

    notifications.forEach((n) => {
      if (!n.id || !n.channel || !n.priority) {
        errors.push(`Notification ${n.id} is missing core fields (id, channel, priority).`);
      }

      if (n.priority === "critical" && !n.recipientUserId && !n.recipientRole && !n.broadcastTarget) {
        warnings.push(`Critical notification ${n.id} [${n.title}] has no assigned recipient or role.`);
      }

      if (n.templateKey && !CommunicationService.getTemplateByKey(n.templateKey)) {
        warnings.push(`Notification ${n.id} references unregistered template key [${n.templateKey}].`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
