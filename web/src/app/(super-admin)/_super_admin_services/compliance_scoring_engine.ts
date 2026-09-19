import {
  ComplianceScoreReport,
  ScoreDimension,
  ScoreTrendPoint,
  RemediationItem,
  ScoreFinding,
} from "../_super_admin_types/compliance_scoring_types";
import { ComplianceHealthStatus } from "../_super_admin_types/compliance_types";

// ─── Utility helpers ────────────────────────────────────────────────────────

function scoreToStatus(score: number): ComplianceHealthStatus {
  if (score >= 90) return "Healthy";
  if (score >= 75) return "Warning";
  return "Critical";
}

function weightedOverall(
  dims: { score: number; weight: number }[]
): number {
  const raw = dims.reduce((acc, d) => acc + d.score * d.weight, 0);
  return Math.round(raw * 10) / 10;
}

// ─── Per-tenant data factory ─────────────────────────────────────────────────

type TenantProfile =
  | "enterprise_healthy"
  | "mid_tier_warning"
  | "critical_tenant";

function tenantProfile(tenantId: string): TenantProfile {
  if (tenantId === "TNT-3105") return "mid_tier_warning";
  if (tenantId === "TENANT-003") return "critical_tenant";
  return "enterprise_healthy";
}

// ─── Dimension builders ──────────────────────────────────────────────────────

function buildAuditDimension(profile: TenantProfile): ScoreDimension {
  const data: Record<TenantProfile, Partial<ScoreDimension> & { findings: ScoreFinding[] }> = {
    enterprise_healthy: {
      score: 100,
      trend: "stable",
      trendDelta: 0,
      findings: [
        {
          id: "AUD-001",
          severity: "Info",
          message: "RBAC audit ledger is fully hash-chained and append-only.",
          affectedArea: "Audit Infrastructure",
          recommendation: "Schedule quarterly external audit review of the chain.",
          regulatoryRef: "NABH 5th Ed – MOM.1",
          resolved: true,
        },
      ],
    },
    mid_tier_warning: {
      score: 78,
      trend: "improving",
      trendDelta: +3.2,
      findings: [
        {
          id: "AUD-002",
          severity: "Warning",
          message: "12% of sensitive data access events are missing actor metadata.",
          affectedArea: "Event Logging",
          recommendation: "Enforce mandatory actor-ID enrichment on all data-access API middleware.",
          regulatoryRef: "NABH 5th Ed – FMS.4 / DPDP Act 2023 – Section 8(4)",
          resolved: false,
        },
        {
          id: "AUD-003",
          severity: "Warning",
          message: "Audit log export to SIEM is 18 hours behind schedule.",
          affectedArea: "SIEM Integration",
          recommendation: "Fix SIEM connector retry policy and escalate to DevOps.",
          resolved: false,
        },
      ],
    },
    critical_tenant: {
      score: 54,
      trend: "declining",
      trendDelta: -8.5,
      findings: [
        {
          id: "AUD-004",
          severity: "Critical",
          message: "Audit logs older than 90 days are not being archived — NABH violation risk.",
          affectedArea: "Log Retention",
          recommendation: "Immediately configure cold-storage archival rule for audit logs (7-year retention mandate).",
          regulatoryRef: "NABH 5th Ed – MOM.1 / GST Act",
          resolved: false,
        },
        {
          id: "AUD-005",
          severity: "Critical",
          message: "No immutability guarantee on audit records — records can be edited.",
          affectedArea: "Audit Integrity",
          recommendation: "Implement append-only RBAC audit store with cryptographic hash chain.",
          resolved: false,
        },
      ],
    },
  };
  const d = data[profile];
  return {
    id: "audit",
    label: "Audit Coverage",
    description: "Measures completeness, integrity, and archival compliance of system audit trails.",
    maxScore: 100,
    weight: 0.20,
    status: scoreToStatus(d.score!),
    ...d,
  } as ScoreDimension;
}

function buildConsentDimension(profile: TenantProfile): ScoreDimension {
  const data: Record<TenantProfile, Partial<ScoreDimension> & { findings: ScoreFinding[] }> = {
    enterprise_healthy: {
      score: 99,
      trend: "stable",
      trendDelta: +0.2,
      findings: [
        {
          id: "CNS-001",
          severity: "Info",
          message: "All active patient consents are within validity window.",
          affectedArea: "Consent Registry",
          recommendation: "Set automated 30-day expiry reminder notifications.",
          regulatoryRef: "DPDP Act 2023 – Section 6",
          resolved: true,
        },
      ],
    },
    mid_tier_warning: {
      score: 82,
      trend: "declining",
      trendDelta: -2.1,
      findings: [
        {
          id: "CNS-002",
          severity: "Warning",
          message: "14 ABHA consent artefacts expired without patient renewal.",
          affectedArea: "ABDM Consent Registry",
          recommendation: "Deploy automated consent-renewal notification workflows 30 days before expiry.",
          regulatoryRef: "ABDM HIU Guidelines – Section 5.3 / DPDP Act 2023 – Section 6(1)",
          resolved: false,
        },
      ],
    },
    critical_tenant: {
      score: 48,
      trend: "declining",
      trendDelta: -11.4,
      findings: [
        {
          id: "CNS-003",
          severity: "Critical",
          message: "No consent records exist for 38% of active patients.",
          affectedArea: "Treatment Consent",
          recommendation: "Immediately onboard Consent Registry and obtain Treatment Consent from all active patients.",
          regulatoryRef: "Indian Medical Council Act – Sec 23 / DPDP Act 2023 – Section 6",
          resolved: false,
        },
        {
          id: "CNS-004",
          severity: "Warning",
          message: "Research data sharing consents are missing data-use scope fields.",
          affectedArea: "Research Consent",
          recommendation: "Update consent form template to include explicit data-use scope and purpose limitation clauses.",
          regulatoryRef: "DPDP Act 2023 – Section 7(b)",
          resolved: false,
        },
      ],
    },
  };
  const d = data[profile];
  return {
    id: "consent",
    label: "Consent Coverage",
    description: "Tracks patient consent completeness across Treatment, ABDM, Telemedicine, Data Sharing, and Research.",
    maxScore: 100,
    weight: 0.25,
    status: scoreToStatus(d.score!),
    ...d,
  } as ScoreDimension;
}

function buildDpdpDimension(profile: TenantProfile): ScoreDimension {
  const data: Record<TenantProfile, Partial<ScoreDimension> & { findings: ScoreFinding[] }> = {
    enterprise_healthy: {
      score: 97,
      trend: "improving",
      trendDelta: +1.5,
      findings: [
        {
          id: "DPDP-001",
          severity: "Info",
          message: "All Data Principal requests fulfilled within 7-day statutory SLA.",
          affectedArea: "DPDP Request Fulfillment",
          recommendation: "Maintain DPO staffing levels to sustain current SLA performance.",
          regulatoryRef: "DPDP Act 2023 – Section 12(2)",
          resolved: true,
        },
      ],
    },
    mid_tier_warning: {
      score: 76,
      trend: "stable",
      trendDelta: -0.8,
      findings: [
        {
          id: "DPDP-002",
          severity: "Warning",
          message: "2 Data Deletion requests pending DPO sign-off beyond 5-day internal SLA.",
          affectedArea: "Data Deletion Workflow",
          recommendation: "DPO must resolve overdue deletion requests. Escalate to Compliance Officer if unresolved in 24 hrs.",
          regulatoryRef: "DPDP Act 2023 – Section 12(3)",
          resolved: false,
        },
        {
          id: "DPDP-003",
          severity: "Warning",
          message: "DPO contact details not publicly published as required.",
          affectedArea: "Transparency & Notice",
          recommendation: "Publish DPO name and contact email on patient-facing portal as mandated.",
          regulatoryRef: "DPDP Act 2023 – Section 9(5)",
          resolved: false,
        },
      ],
    },
    critical_tenant: {
      score: 41,
      trend: "declining",
      trendDelta: -14.2,
      findings: [
        {
          id: "DPDP-004",
          severity: "Critical",
          message: "No Data Protection Officer (DPO) designated — statutory violation.",
          affectedArea: "DPO Designation",
          recommendation: "Appoint a Data Protection Officer immediately as required under DPDP Act 2023.",
          regulatoryRef: "DPDP Act 2023 – Section 9(1)",
          resolved: false,
        },
        {
          id: "DPDP-005",
          severity: "Critical",
          message: "11 open DPDP Data Principal requests with no assigned DPO — SLA breach.",
          affectedArea: "Request Triage",
          recommendation: "Assign all pending requests to interim compliance officer pending DPO appointment.",
          regulatoryRef: "DPDP Act 2023 – Section 12",
          resolved: false,
        },
        {
          id: "DPDP-006",
          severity: "Warning",
          message: "Privacy notice on patient registration portal missing purpose-limitation clauses.",
          affectedArea: "Privacy Notice",
          recommendation: "Update patient onboarding privacy notice per DPDP notice requirements.",
          regulatoryRef: "DPDP Act 2023 – Section 5",
          resolved: false,
        },
      ],
    },
  };
  const d = data[profile];
  return {
    id: "dpdp",
    label: "DPDP Readiness",
    description: "Evaluates compliance with India Digital Personal Data Protection Act 2023 obligations.",
    maxScore: 100,
    weight: 0.25,
    status: scoreToStatus(d.score!),
    ...d,
  } as ScoreDimension;
}

function buildPolicyDimension(profile: TenantProfile): ScoreDimension {
  const data: Record<TenantProfile, Partial<ScoreDimension> & { findings: ScoreFinding[] }> = {
    enterprise_healthy: {
      score: 98,
      trend: "stable",
      trendDelta: 0,
      findings: [
        {
          id: "POL-001",
          severity: "Info",
          message: "All 12 governance policies reviewed within the last 12 months.",
          affectedArea: "Policy Governance",
          recommendation: "Continue annual review schedule; flag 3 policies due in 60 days.",
          regulatoryRef: "NABH 5th Ed – COP.1",
          resolved: true,
        },
      ],
    },
    mid_tier_warning: {
      score: 79,
      trend: "declining",
      trendDelta: -3.4,
      findings: [
        {
          id: "POL-002",
          severity: "Warning",
          message: "Clinical Data Protection Policy overdue for annual review by 45 days.",
          affectedArea: "Data Privacy Policy",
          recommendation: "Schedule immediate policy review meeting with Clinical Governance committee.",
          regulatoryRef: "NABH 5th Ed – COP.2 / DPDP Act 2023 – Section 8(6)",
          resolved: false,
        },
        {
          id: "POL-003",
          severity: "Warning",
          message: "Information Security Policy has not been ratified since v2.1 (2024).",
          affectedArea: "Security Policy",
          recommendation: "Update policy to include cloud-native security controls and RBAC provisions.",
          resolved: false,
        },
      ],
    },
    critical_tenant: {
      score: 38,
      trend: "declining",
      trendDelta: -18.0,
      findings: [
        {
          id: "POL-004",
          severity: "Critical",
          message: "No formal governance policy framework exists — no documented policies found.",
          affectedArea: "Policy Framework",
          recommendation: "Adopt HMS standard governance policy templates immediately. Minimum 6 policies required for NABH.",
          regulatoryRef: "NABH 5th Ed – Chapter 3",
          resolved: false,
        },
        {
          id: "POL-005",
          severity: "Critical",
          message: "Patient Rights policy absent — violates NABH Patient Rights standard.",
          affectedArea: "Patient Rights",
          recommendation: "Draft and ratify Patient Rights & Responsibilities policy with medical director sign-off.",
          regulatoryRef: "NABH 5th Ed – PRE.1",
          resolved: false,
        },
      ],
    },
  };
  const d = data[profile];
  return {
    id: "policy",
    label: "Policy Compliance",
    description: "Tracks governance policy coverage, review schedules, and NABH chapter alignment.",
    maxScore: 100,
    weight: 0.20,
    status: scoreToStatus(d.score!),
    ...d,
  } as ScoreDimension;
}

function buildBreakGlassDimension(profile: TenantProfile): ScoreDimension {
  const data: Record<TenantProfile, Partial<ScoreDimension> & { findings: ScoreFinding[] }> = {
    enterprise_healthy: {
      score: 96,
      trend: "stable",
      trendDelta: +0.4,
      findings: [
        {
          id: "BG-001",
          severity: "Info",
          message: "All 3 Break Glass events this month were reviewed and approved within 24 hrs.",
          affectedArea: "Break Glass Audit",
          recommendation: "Review any Break Glass access patterns quarterly for anomaly detection.",
          regulatoryRef: "NABH 5th Ed – MOM.6",
          resolved: true,
        },
      ],
    },
    mid_tier_warning: {
      score: 83,
      trend: "improving",
      trendDelta: +2.8,
      findings: [
        {
          id: "BG-002",
          severity: "Warning",
          message: "1 Break Glass event flagged for review — no emergency justification documented.",
          affectedArea: "Emergency Access Justification",
          recommendation: "Require mandatory emergency reason field before Break Glass unlock proceeds.",
          regulatoryRef: "NABH 5th Ed – MOM.6",
          resolved: false,
        },
      ],
    },
    critical_tenant: {
      score: 22,
      trend: "declining",
      trendDelta: -22.5,
      findings: [
        {
          id: "BG-003",
          severity: "Critical",
          message: "Break Glass emergency access module not enabled for this tenant — emergency record access is currently uncontrolled.",
          affectedArea: "Emergency Access",
          recommendation: "Implement Break Glass access module with mandatory audit logging immediately.",
          regulatoryRef: "NABH 5th Ed – MOM.6 / ISO 27001 – A.9.4.2",
          resolved: false,
        },
        {
          id: "BG-004",
          severity: "Critical",
          message: "9 unlogged emergency record accesses detected in last 30 days.",
          affectedArea: "Uncontrolled Access",
          recommendation: "Retroactively audit unlogged accesses and enforce Break Glass protocol going forward.",
          resolved: false,
        },
      ],
    },
  };
  const d = data[profile];
  return {
    id: "breakGlass",
    label: "Break Glass Compliance",
    description: "Monitors emergency clinical access events for audit completeness, justification, and timely review.",
    maxScore: 100,
    weight: 0.10,
    status: scoreToStatus(d.score!),
    ...d,
  } as ScoreDimension;
}

function buildTrendHistory(profile: TenantProfile): ScoreTrendPoint[] {
  const bases: Record<TenantProfile, ScoreTrendPoint> = {
    enterprise_healthy: {
      period: "Sep 2026", overallScore: 98.1,
      auditScore: 100, consentScore: 99, dpdpScore: 97, policyScore: 98, breakGlassScore: 96,
    },
    mid_tier_warning: {
      period: "Sep 2026", overallScore: 80.2,
      auditScore: 78, consentScore: 82, dpdpScore: 76, policyScore: 79, breakGlassScore: 83,
    },
    critical_tenant: {
      period: "Sep 2026", overallScore: 42.5,
      auditScore: 54, consentScore: 48, dpdpScore: 41, policyScore: 38, breakGlassScore: 22,
    },
  };

  const base = bases[profile];

  // Build 6-month history by stepping back
  const months = ["Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"];
  const deltas: Record<TenantProfile, number[]> = {
    enterprise_healthy: [-1.2, -0.5, 0, +0.3, +0.5, 0],
    mid_tier_warning: [+6.4, +4.2, +2.8, +1.0, -1.4, 0],
    critical_tenant: [+18.0, +14.5, +10.2, +6.8, +3.1, 0],
  };

  return months.map((period, i) => {
    const delta = deltas[profile].slice(i).reduce((a, b) => a + b, 0);
    return {
      period,
      overallScore: Math.max(0, Math.min(100, Math.round((base.overallScore - delta) * 10) / 10)),
      auditScore: Math.max(0, Math.min(100, Math.round((base.auditScore - delta * 0.9) * 10) / 10)),
      consentScore: Math.max(0, Math.min(100, Math.round((base.consentScore - delta * 1.1) * 10) / 10)),
      dpdpScore: Math.max(0, Math.min(100, Math.round((base.dpdpScore - delta * 1.2) * 10) / 10)),
      policyScore: Math.max(0, Math.min(100, Math.round((base.policyScore - delta * 0.8) * 10) / 10)),
      breakGlassScore: Math.max(0, Math.min(100, Math.round((base.breakGlassScore - delta * 0.6) * 10) / 10)),
    };
  });
}

function buildRemediations(
  audit: ScoreDimension,
  consent: ScoreDimension,
  dpdp: ScoreDimension,
  policy: ScoreDimension,
  breakGlass: ScoreDimension,
): RemediationItem[] {
  const items: RemediationItem[] = [];
  let counter = 0;
  const allDims = [audit, consent, dpdp, policy, breakGlass];

  for (const dim of allDims) {
    for (const f of dim.findings) {
      if (f.resolved) continue;
      counter++;
      items.push({
        id: `REM-${String(counter).padStart(3, "0")}`,
        priority: f.severity === "Critical" ? "Critical" : f.severity === "Warning" ? "High" : "Medium",
        dimensionId: dim.id,
        dimensionLabel: dim.label,
        title: f.message,
        detail: f.recommendation,
        estimatedEffort: f.severity === "Critical" ? "1–3 days" : "1–2 weeks",
        scoreLift: f.severity === "Critical" ? 8 : f.severity === "Warning" ? 3 : 1,
        regulatoryRef: f.regulatoryRef,
        status: "Open",
      });
    }
  }

  // Sort: Critical first, then High, then by score lift descending
  return items.sort((a, b) => {
    const pOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return b.scoreLift - a.scoreLift;
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export class ComplianceScoringEngine {
  public static calculateComplianceScore(tenantId: string = "TNT-9014", tenantName: string = "Apollo Super Speciality Hospital"): ComplianceScoreReport {
    return this.generateReport(tenantId, tenantName);
  }

  public static getScoreBreakdown(tenantId: string = "TNT-9014", tenantName: string = "Apollo Super Speciality Hospital"): ComplianceScoreReport {
    return this.generateReport(tenantId, tenantName);
  }

  public static generateReport(tenantId: string, tenantName: string): ComplianceScoreReport {
    const profile = tenantProfile(tenantId);

    const audit = buildAuditDimension(profile);
    const consent = buildConsentDimension(profile);
    const dpdp = buildDpdpDimension(profile);
    const policy = buildPolicyDimension(profile);
    const breakGlass = buildBreakGlassDimension(profile);

    const dims = [audit, consent, dpdp, policy, breakGlass];
    const overallScore = weightedOverall(dims.map((d) => ({ score: d.score, weight: d.weight })));
    const overallStatus = scoreToStatus(overallScore);

    // Determine overall trend from majority of dimensions
    const trends = dims.map((d) => d.trend);
    const improving = trends.filter((t) => t === "improving").length;
    const declining = trends.filter((t) => t === "declining").length;
    const overallTrend = improving > declining ? "improving" : declining > improving ? "declining" : "stable";
    const overallTrendDelta = Math.round(dims.reduce((a, d) => a + d.trendDelta, 0) / dims.length * 10) / 10;

    const trendHistory = buildTrendHistory(profile);
    const remediations = buildRemediations(audit, consent, dpdp, policy, breakGlass);

    // Regulatory stubs — placeholder scores ready for future API integration
    const nabh = profile === "enterprise_healthy" ? 96 : profile === "mid_tier_warning" ? 79 : 41;
    const nabl = profile === "enterprise_healthy" ? 98 : profile === "mid_tier_warning" ? 88 : 52;
    const abdm = profile === "enterprise_healthy" ? 100 : profile === "mid_tier_warning" ? 84 : 35;

    return {
      tenantId,
      tenantName,
      generatedAt: new Date().toISOString(),
      period: "September 2026",
      overallScore,
      overallStatus,
      overallTrend,
      overallTrendDelta,
      dimensions: { audit, consent, dpdp, policy, breakGlass },
      trendHistory,
      remediations,
      regulatoryStubs: {
        nabhReadinessScore: nabh,
        nablReadinessScore: nabl,
        abdmReadinessScore: abdm,
        dpdpComplianceScore: dpdp.score,
        lastNabhAuditDate: "2026-03-15",
        nextNabhAuditDue: "2027-03-15",
      },
    };
  }

  /** Returns a status label string for display */
  public static getStatusLabel(score: number): string {
    if (score >= 90) return "Healthy";
    if (score >= 75) return "Warning";
    return "Critical";
  }

  /** Calculates total potential score improvement if all open remediations resolved */
  public static calculateMaxScoreLift(report: ComplianceScoreReport): number {
    return report.remediations
      .filter((r) => r.status === "Open" || r.status === "In Progress")
      .reduce((acc, r) => acc + r.scoreLift, 0);
  }
}
