import { ComplianceHealthStatus } from "./compliance_types";

// ─── Individual Dimension Scores ────────────────────────────────────────────

export interface ScoreDimension {
  id: string;
  label: string;
  description: string;
  score: number;           // 0–100
  maxScore: number;        // always 100
  weight: number;          // 0–1, sum across dimensions = 1.0
  status: ComplianceHealthStatus;
  trend: "improving" | "stable" | "declining";
  trendDelta: number;      // +/- change vs last period
  findings: ScoreFinding[];
}

export interface ScoreFinding {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  message: string;
  affectedArea: string;
  recommendation: string;
  regulatoryRef?: string;  // e.g. "NABH 5th Ed – Chapter 4.2", "DPDP Act 2023 – Section 8(1)"
  resolved: boolean;
}

// ─── Trend Data Point ────────────────────────────────────────────────────────

export interface ScoreTrendPoint {
  period: string;          // e.g. "Sep 2026", "Aug 2026"
  overallScore: number;
  auditScore: number;
  consentScore: number;
  dpdpScore: number;
  policyScore: number;
  breakGlassScore: number;
}

// ─── Remediation Recommendation ─────────────────────────────────────────────

export interface RemediationItem {
  id: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  dimensionId: string;
  dimensionLabel: string;
  title: string;
  detail: string;
  estimatedEffort: string;   // e.g. "2–4 hours", "1 week"
  scoreLift: number;         // estimated score improvement if resolved
  regulatoryRef?: string;
  assignedTo?: string;
  dueDate?: string;
  status: "Open" | "In Progress" | "Resolved";
}

// ─── Full Compliance Score Report ────────────────────────────────────────────

export interface ComplianceScoreReport {
  tenantId: string;
  tenantName: string;
  generatedAt: string;
  period: string;             // e.g. "September 2026"
  overallScore: number;
  overallStatus: ComplianceHealthStatus;
  overallTrend: "improving" | "stable" | "declining";
  overallTrendDelta: number;

  dimensions: {
    audit: ScoreDimension;
    consent: ScoreDimension;
    dpdp: ScoreDimension;
    policy: ScoreDimension;
    breakGlass: ScoreDimension;
  };

  trendHistory: ScoreTrendPoint[];
  remediations: RemediationItem[];

  // Future regulatory reporting stubs
  regulatoryStubs: {
    nabhReadinessScore: number;
    nablReadinessScore: number;
    abdmReadinessScore: number;
    dpdpComplianceScore: number;
    lastNabhAuditDate?: string;
    nextNabhAuditDue?: string;
  };
}
