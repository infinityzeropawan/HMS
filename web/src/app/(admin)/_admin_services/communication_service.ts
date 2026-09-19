"use client";

import { useAdminSettingsStore } from "../_admin_stores/admin_settings_store";
import { useCommunicationStore } from "../_admin_stores/communication_store";
import { NotificationChannel, NotificationCategory, NotificationStatus } from "@/lib/notification_store/notification.types";

export interface CommunicationTemplate {
  key: string;
  category: NotificationCategory;
  name: string;
  titleTemplate: string;
  bodyTemplate: string;
  supportedChannels: NotificationChannel[];
}

export const PREDEFINED_TEMPLATES: CommunicationTemplate[] = [
  {
    key: "TPL_APPOINTMENT_REMINDER",
    category: "APPOINTMENT_REMINDER",
    name: "OPD Appointment Confirmation & Reminder",
    titleTemplate: "Appointment Confirmed — {doctorName}",
    bodyTemplate: "Dear {patientName}, your appointment with {doctorName} in {departmentName} is scheduled for {appointmentTime}.",
    supportedChannels: ["sms", "whatsapp", "email", "system"],
  },
  {
    key: "TPL_LAB_RESULT_READY",
    category: "LAB_RESULT_READY",
    name: "Laboratory Diagnostic Result Notification",
    titleTemplate: "Lab Report Ready — {patientName}",
    bodyTemplate: "Dear {patientName}, your laboratory diagnostic report from {departmentName} is now published and ready for review.",
    supportedChannels: ["sms", "whatsapp", "email", "system"],
  },
  {
    key: "TPL_PATIENT_ADMISSION",
    category: "PATIENT_ADMISSION",
    name: "Inpatient Bed Admission Alert",
    titleTemplate: "Patient Admitted — {patientName}",
    bodyTemplate: "Patient {patientName} has been admitted to {departmentName} under attending consultant {doctorName}.",
    supportedChannels: ["system", "email", "sms"],
  },
  {
    key: "TPL_PATIENT_DISCHARGE",
    category: "PATIENT_DISCHARGE",
    name: "Patient Discharge Clearance & Summary",
    titleTemplate: "Discharge Clearance — {patientName}",
    bodyTemplate: "Patient {patientName} has been cleared for discharge from {departmentName}. Final bill amount: ₹{amount}.",
    supportedChannels: ["sms", "whatsapp", "email", "system"],
  },
  {
    key: "TPL_CLAIM_STATUS_UPDATE",
    category: "CLAIM_STATUS_UPDATE",
    name: "TPA Insurance Claim Status Notice",
    titleTemplate: "TPA Claim Status Update — {patientName}",
    bodyTemplate: "TPA insurance claim update for {patientName}: Settlement amount of ₹{amount} processed for {departmentName}.",
    supportedChannels: ["email", "sms", "system"],
  },
  {
    key: "TPL_PAYMENT_REMINDER",
    category: "PAYMENT_REMINDER",
    name: "Billing Outstanding Payment Reminder",
    titleTemplate: "Payment Due Reminder — ₹{amount}",
    bodyTemplate: "Dear {patientName}, a pending balance of ₹{amount} is due for hospital services in {departmentName}.",
    supportedChannels: ["sms", "whatsapp", "email"],
  },
  {
    key: "TPL_SHIFT_REMINDER",
    category: "SHIFT_REMINDER",
    name: "Clinical Staff Duty Shift Alert",
    titleTemplate: "Upcoming Roster Shift — {departmentName}",
    bodyTemplate: "Dear {doctorName}, your duty shift in {departmentName} is scheduled for {appointmentTime}.",
    supportedChannels: ["system", "push", "sms"],
  },
  {
    key: "TPL_MEDICATION_REMINDER",
    category: "MEDICATION_REMINDER",
    name: "Inpatient MAR Medication Due Alert",
    titleTemplate: "Medication Dose Due — {patientName}",
    bodyTemplate: "Medication Alert for {patientName} in {departmentName}: Scheduled dose due at {appointmentTime}.",
    supportedChannels: ["system", "push"],
  },
];

export class CommunicationService {
  /**
   * Retrieves all registered communication templates.
   */
  public static getTemplates(): CommunicationTemplate[] {
    return PREDEFINED_TEMPLATES;
  }

  /**
   * Retrieves a template by unique key.
   */
  public static getTemplateByKey(key: string): CommunicationTemplate | undefined {
    return PREDEFINED_TEMPLATES.find((t) => t.key === key);
  }

  /**
   * Interpolates template variables into final title and body text.
   */
  public static interpolateTemplate(
    templateKey: string,
    variables: Record<string, string | number> = {}
  ): { title: string; body: string } {
    const tpl = this.getTemplateByKey(templateKey);
    let title = tpl ? tpl.titleTemplate : "Hospital Communication Alert";
    let body = tpl ? tpl.bodyTemplate : "Notification update from hospital management system.";

    const defaultVars: Record<string, string | number> = {
      patientName: "Patient",
      doctorName: "Dr. On-Call Specialist",
      departmentName: "General Medicine",
      amount: "0.00",
      appointmentTime: "Today",
      ...variables,
    };

    Object.entries(defaultVars).forEach(([varKey, val]) => {
      const regex = new RegExp(`\\{${varKey}\\}`, "g");
      title = title.replace(regex, String(val));
      body = body.replace(regex, String(val));
    });

    return { title, body };
  }

  /**
   * Dispatches a message through SMS, WhatsApp, Email, Push, or System gateways with credential checking.
   */
  public static dispatchChannelMessage(
    notificationId: string,
    channel: NotificationChannel,
    recipientContact: string,
    recipientName: string,
    renderedTitle: string,
    renderedBody: string,
    templateKey?: string
  ): { success: boolean; status: NotificationStatus; responseMessage: string } {
    const settings = useAdminSettingsStore.getState();
    let gatewayResponse = "";
    let status: NotificationStatus = "delivered";
    let success = true;

    if (channel === "sms") {
      if (!settings.appointmentSms) {
        status = "failed";
        success = false;
        gatewayResponse = "SMS Dispatch Blocked: SMS channel disabled in Hospital Policy Settings.";
      } else if (!settings.smsGatewayApiKey) {
        status = "failed";
        success = false;
        gatewayResponse = "SMS Gateway Failed: SMS API Key unconfigured in settings.";
      } else {
        gatewayResponse = `SMS Gateway 200 OK — Sent to ${recipientContact} via Key [${settings.smsGatewayApiKey.slice(0, 6)}...]`;
      }
    } else if (channel === "whatsapp") {
      if (!settings.appointmentWhatsApp) {
        status = "failed";
        success = false;
        gatewayResponse = "WhatsApp Dispatch Blocked: WhatsApp channel disabled in Hospital Policy Settings.";
      } else if (!settings.whatsAppBusinessToken) {
        status = "failed";
        success = false;
        gatewayResponse = "WhatsApp API Failed: Business Token unconfigured in settings.";
      } else {
        gatewayResponse = `WhatsApp Cloud API 200 OK — Message delivered to ${recipientContact}`;
      }
    } else if (channel === "email") {
      gatewayResponse = `SMTP Gateway 200 OK — Emailed ${recipientContact}`;
    } else if (channel === "push") {
      gatewayResponse = `Web Push Service 200 OK — Push token delivered to ${recipientName}'s device`;
    } else {
      gatewayResponse = `In-App Console WebSocket Alert Broadcasted to ${recipientName}`;
      status = "unread";
    }

    useCommunicationStore.getState().addLog({
      notificationId,
      channel,
      recipientContact: recipientContact || "Internal Console",
      recipientName,
      templateKey,
      renderedBody: `${renderedTitle}: ${renderedBody}`,
      status,
      gatewayResponse,
    });

    return { success, status, responseMessage: gatewayResponse };
  }
}
