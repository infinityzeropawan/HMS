export type TenantStatus =
  | "Active"
  | "Trial"
  | "Suspended"
  | "Expired"
  | "Pending Verification"
  | "Archived";

export type TenantHealthStatus = "Healthy" | "Warning" | "Critical" | "Offline";

export type HealthLevel = "Healthy" | "Warning" | "Critical" | "Offline";

export type SubscriptionPlan =
  | "Enterprise"
  | "Super Specialty"
  | "Professional"
  | "Basic"
  | "Custom";

export type HospitalType =
  | "Multi-Specialty"
  | "Super-Specialty"
  | "Single-Specialty"
  | "General Hospital"
  | "Clinic Chain"
  | "Teaching Hospital";

export type SuspensionReason =
  | "Non Payment"
  | "Compliance Issue"
  | "Security Incident"
  | "Requested by Customer"
  | "Other";

export interface InfrastructureServiceItem {
  id: string;
  name: string;
  status: HealthLevel;
  pingMs: number;
  lastCheck: string;
  errorTrace?: string;
  affectedNodes?: string[];
  recommendedAction?: string;
}

export interface InfrastructureHealth {
  database: InfrastructureServiceItem;
  api: InfrastructureServiceItem;
  backgroundJobs: InfrastructureServiceItem;
  notificationService: InfrastructureServiceItem;
  storageService: InfrastructureServiceItem;
}

export interface DataProtectionHealth {
  lastBackupTime: string;
  backupStatus: HealthLevel;
  lastRestoreTest: string;
  backupRetentionStatus: string;
  backupSizeBytes: string;
}

export interface PerformanceHealth {
  avgApiResponseTimeMs: number;
  activeSessions: number;
  concurrentUsers: number;
  errorRatePct: number;
}

export interface UsageHealth {
  userUtilizationPct: number;
  bedUtilizationPct: number;
  storageUtilizationPct: number;
  apiUtilizationPct: number;
}

export interface ServiceDiagnosticIncident {
  id: string;
  serviceId: string;
  serviceName: string;
  status: HealthLevel;
  errorTrace: string;
  affectedNodes: string[];
  lastPing: string;
  recommendedAction: string;
}

export interface TenantHealthTelemetry {
  tenantId: string;
  overallStatus: HealthLevel;
  infrastructure: InfrastructureHealth;
  dataProtection: DataProtectionHealth;
  performance: PerformanceHealth;
  usage: UsageHealth;
  incidents: ServiceDiagnosticIncident[];
}

export interface SuspensionRecord {
  id: string;
  action: "SUSPEND" | "RESTORE";
  adminName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string; // ISO string
  reason: SuspensionReason;
  reasonNotes?: string;
}

export interface TenantComplianceStatus {
  nabh: "Full Accreditation" | "Provisional" | "In Progress" | "Not Applied";
  nabl: "Accredited Lab" | "Pending Renewal" | "In Progress" | "Not Applied";
  hfr: "Registered & Verified" | "Verification Pending";
  abdm: "Level M1, M2 & M3 Certified" | "Level 2 Certified" | "In Progress";
  nabhCertNo?: string;
  nablCertNo?: string;
  hfrId?: string;
  abdmGatewayId?: string;
}

import type { EmailBrandingConfig, PdfBrandingConfig, WhiteLabelConfig } from "./branding_types";

export interface TenantBrandingConfig {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  prescriptionHeader: string;
  patientPortalTitle: string;
  watermarkText: string;
  emailBranding?: EmailBrandingConfig;
  pdfBranding?: PdfBrandingConfig;
  whiteLabel?: WhiteLabelConfig;
}

export interface TenantSubscriptionDetail {
  currentPlan: SubscriptionPlan;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  autoRenewal: boolean;
  paymentStatus: "Paid" | "Pending" | "Overdue" | "Trial Waiver";
  lastInvoice: string; // e.g. INV-2026-0891 (₹4,50,000)
  billingCycle: "Monthly" | "Annual";
}

export interface Tenant {
  id: string; // Tenant ID e.g. TNT-9014
  hospitalName: string;
  hospitalType: HospitalType;
  city: string;
  state: string;
  address: string;
  contactPerson: string;
  subscriptionPlan: SubscriptionPlan;
  status: TenantStatus;
  activeUsers: number;
  maxUsers: number;
  bedCount: number;
  maxBeds: number;
  storageUsedGB: number;
  maxStorageGB: number;
  lastActivity: string; // ISO string or relative label
  lastLogin: string;
  createdDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  healthStatus: TenantHealthStatus;

  // Extended properties for detail workspace
  subdomain: string;
  adminEmail: string;
  adminPhone: string;
  gstin: string;
  mrr: number; // Monthly recurring revenue in INR
  joinedDate: string;
  slaUptime: number; // e.g. 99.98
  enabledModules: string[];
  compliance: TenantComplianceStatus;
  branding: TenantBrandingConfig;
  subscriptionDetail: TenantSubscriptionDetail;
  suspensionHistory: SuspensionRecord[];
}

export interface TenantFilterParams {
  searchName?: string;
  searchId?: string;
  plan?: string;
  status?: string;
  state?: string;
  hospitalType?: string;
  expiryFilter?: "all" | "7days" | "30days" | "90days" | "expired";
}

export interface TenantSortParams {
  field: "hospitalName" | "activeUsers" | "bedCount" | "storageUsedGB" | "expiryDate" | "lastActivity";
  order: "asc" | "desc";
}

export interface PaginatedTenantResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  pageSize: number;
  stats: TenantStats;
}

export interface TenantStats {
  totalHospitals: number;
  activeHospitals: number;
  trialHospitals: number;
  expiredHospitals: number;
  suspendedHospitals: number;
  monthlyRevenue: number;
}

export interface TenantUsageMetrics {
  tenantId: string;
  activeUserSeats: { used: number; total: number };
  bedCapacity: { allocated: number; total: number };
  storageUsage: { usedGB: number; totalGB: number };
  apiThroughput: string;
  dbSizeBytes: string;
  monthlyConsultations: number;
  monthlyLabOrders: number;
  monthlyActiveUsers: number;
  monthlyApiRequests: number;
}

export type AuditCategory =
  | "SECURITY"
  | "LICENSE"
  | "SYSTEM"
  | "CONFIG"
  | "CONSENT_EVENT"
  | "DPDP_REQUEST"
  | "BREAK_GLASS_ACCESS"
  | "ROLE_PERMISSION_CHANGE"
  | "RETENTION_POLICY_CHANGE"
  | "COMPLIANCE_EVENT"
  | "BRANDING_CHANGE"
  | "WHITE_LABEL_CHANGE"
  | "SUBSCRIPTION_LIFECYCLE"
  | "FEATURE_LICENSE_EVENT"
  | "GOVERNANCE_EVENT";

export interface TenantAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  ipAddress: string;
  category: AuditCategory;
  details: string;
  severity?: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  tenantId?: string;
}
