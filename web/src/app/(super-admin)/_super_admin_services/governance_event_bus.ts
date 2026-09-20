import { PlatformAuditService, ExtendedAuditCategory } from "./platform_audit_service";
import { ComplianceScoringEngine } from "./compliance_scoring_engine";
import { ComplianceService } from "./compliance_service";

export type GovernanceEventType =
  | "CONSENT_REVOKED"
  | "CONSENT_EXPIRED"
  | "DPDP_REQUEST_COMPLETED"
  | "RETENTION_WARNING_TRIGGERED"
  | "BREAK_GLASS_ACCESS_USED"
  | "ROLE_PERMISSION_CHANGE"
  | "BRANDING_CHANGE"
  | "WHITE_LABEL_CHANGE"
  | "TENANT_SUSPENDED"
  | "TENANT_RESTORED";

export interface GovernanceEventPayload {
  eventType: GovernanceEventType;
  tenantId: string;
  tenantName: string;
  actor: string;
  actorRole: string;
  action: string;
  details: Record<string, unknown> | string;
  timestamp?: string;
  riskLevel?: "INFO" | "WARNING" | "CRITICAL";
}

type EventListener = (event: GovernanceEventPayload) => void;

class GovernanceEventBusSingleton {
  private listeners: EventListener[] = [];

  public emit(payload: GovernanceEventPayload): void {
    const timestamp = payload.timestamp || new Date().toISOString().replace("T", " ").substring(0, 19);
    
    // Map event type to Audit category
    let category: ExtendedAuditCategory = "GOVERNANCE_EVENT";
    switch (payload.eventType) {
      case "TENANT_SUSPENDED":
      case "TENANT_RESTORED":
        category = "SUBSCRIPTION_LIFECYCLE";
        break;
      case "CONSENT_REVOKED":
      case "CONSENT_EXPIRED":
        category = "CONSENT_EVENT";
        break;
      case "DPDP_REQUEST_COMPLETED":
        category = "DPDP_REQUEST";
        break;
      case "RETENTION_WARNING_TRIGGERED":
        category = "RETENTION_POLICY_CHANGE";
        break;
      case "BREAK_GLASS_ACCESS_USED":
        category = "BREAK_GLASS_ACCESS";
        break;
      case "ROLE_PERMISSION_CHANGE":
        category = "ROLE_PERMISSION_CHANGE";
        break;
      case "BRANDING_CHANGE":
        category = "BRANDING_CHANGE";
        break;
      case "WHITE_LABEL_CHANGE":
        category = "WHITE_LABEL_CHANGE";
        break;
    }


    // 1. Log to Platform Audit Service
    PlatformAuditService.recordAuditEvent({
      actor: payload.actor,
      actorRole: payload.actorRole,
      action: payload.action,
      category,
      entity: `${payload.tenantName} (${payload.tenantId})`,
      ipAddress: "103.44.120.14",
      riskLevel: payload.riskLevel || (payload.eventType === "BREAK_GLASS_ACCESS_USED" ? "CRITICAL" : payload.eventType.includes("REVOKED") || payload.eventType.includes("WARNING") ? "WARNING" : "INFO"),
      details: typeof payload.details === "string" ? payload.details : JSON.stringify(payload.details),
      timestamp,
    });

    // 2. Trigger Compliance Scoring Recalculation
    ComplianceScoringEngine.calculateComplianceScore(payload.tenantId);

    // 3. Update Compliance Dashboard KPI metrics
    ComplianceService.getComplianceKPIs(payload.tenantId);

    // 4. Notify all registered listeners
    this.listeners.forEach((l) => {
      try {
        l(payload);
      } catch (err) {
        console.error("Error in GovernanceEventBus listener:", err);
      }
    });
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }
}

export const GovernanceEventBus = new GovernanceEventBusSingleton();
