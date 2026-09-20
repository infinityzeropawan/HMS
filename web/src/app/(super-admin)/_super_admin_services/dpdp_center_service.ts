import {
  DpdpPrincipalRequest,
  DpdpFilterParams,
  DpdpMetrics,
  DpdpWorkflowState,
  DpdpRequestType,
} from "../_super_admin_types/dpdp_center_types";
import { GovernanceEventBus } from "./governance_event_bus";

const INITIAL_DPDP_REQUESTS: DpdpPrincipalRequest[] = [
  {
    requestId: "DPDP-REQ-2026-901",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Vikram Malhotra",
    dataPrincipalEmail: "vikram.m@gmail.com",
    dataPrincipalPhone: "+91 98765 43210",
    dataPrincipalCategory: "PATIENT",
    requestType: "Data Access Request",
    workflowState: "Completed",
    submittedDate: "2026-09-10 10:15:00 AM",
    slaDueDate: "2026-09-17 10:15:00 AM",
    completedDate: "2026-09-12 03:30:00 PM",
    processingTimeDays: 2.2,
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Request for complete summary of processed personal and clinical diagnostic records for FY25.",
    dpoResolutionNotes: "Compiled encrypted PDF ledger of clinical encounters and dispatched via verified email.",
    statutoryClause: "Section 11(1) Right to Information of Processed Data",
    history: [
      { state: "Submitted", timestamp: "2026-09-10 10:15:00 AM", actor: "Vikram Malhotra" },
      { state: "Under Review", timestamp: "2026-09-11 09:00:00 AM", actor: "DPO Desk" },
      { state: "Approved", timestamp: "2026-09-11 04:00:00 PM", actor: "Adv. Meenakshi Sundaram" },
      { state: "Completed", timestamp: "2026-09-12 03:30:00 PM", actor: "Adv. Meenakshi Sundaram", notes: "FHIR Data Package Delivered." },
    ],
  },
  {
    requestId: "DPDP-REQ-2026-902",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Ananya Deshmukh",
    dataPrincipalEmail: "ananya.d@outlooks.com",
    dataPrincipalPhone: "+91 98112 23344",
    dataPrincipalCategory: "PATIENT",
    requestType: "Data Deletion Request",
    workflowState: "Under Review",
    submittedDate: "2026-09-16 02:20:00 PM",
    slaDueDate: "2026-09-23 02:20:00 PM",
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Request to purge non-clinical marketing telemetry and inactive mobile app session logs.",
    statutoryClause: "Section 12(3) Right to Erasure / Purge Non-Mandated Data",
    history: [
      { state: "Submitted", timestamp: "2026-09-16 02:20:00 PM", actor: "Ananya Deshmukh" },
      { state: "Under Review", timestamp: "2026-09-17 11:00:00 AM", actor: "DPO Security Desk", notes: "Verifying statutory retention overrides for active billing invoices." },
    ],
  },
  {
    requestId: "DPDP-REQ-2026-903",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Suresh Iyer",
    dataPrincipalEmail: "suresh.iyer@yahoo.in",
    dataPrincipalPhone: "+91 99400 55667",
    dataPrincipalCategory: "PATIENT",
    requestType: "Consent Withdrawal Request",
    workflowState: "Submitted",
    submittedDate: "2026-09-18 09:30:00 AM",
    slaDueDate: "2026-09-25 09:30:00 AM",
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Withdraw consent for third-party TPA insurance promotional data sharing.",
    statutoryClause: "Section 6(4) Right to Withdraw Processing Consent",
    history: [
      { state: "Submitted", timestamp: "2026-09-18 09:30:00 AM", actor: "Suresh Iyer" },
    ],
  },
  {
    requestId: "DPDP-REQ-2026-904",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Dr. Saravanan",
    dataPrincipalEmail: "dr.saravanan@apollo.hms.com",
    dataPrincipalPhone: "+91 98400 12345",
    dataPrincipalCategory: "DOCTOR",
    requestType: "Data Correction Request",
    workflowState: "Approved",
    submittedDate: "2026-09-15 11:00:00 AM",
    slaDueDate: "2026-09-22 11:00:00 AM",
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Correction of staff registration medical council registration number and contact address.",
    dpoResolutionNotes: "Medical council certificate verified. Corrected staff master record.",
    statutoryClause: "Section 12(1) Right to Correction & Updating",
    history: [
      { state: "Submitted", timestamp: "2026-09-15 11:00:00 AM", actor: "Dr. Saravanan" },
      { state: "Under Review", timestamp: "2026-09-16 10:00:00 AM", actor: "HR Compliance Desk" },
      { state: "Approved", timestamp: "2026-09-17 03:00:00 PM", actor: "Adv. Meenakshi Sundaram" },
    ],
  },
  {
    requestId: "DPDP-REQ-2026-905",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Ramesh Reddy",
    dataPrincipalEmail: "ramesh.reddy@gmail.com",
    dataPrincipalPhone: "+91 97000 88990",
    dataPrincipalCategory: "PATIENT",
    requestType: "Data Export Request",
    workflowState: "Completed",
    submittedDate: "2026-09-08 04:00:00 PM",
    slaDueDate: "2026-09-15 04:00:00 PM",
    completedDate: "2026-09-09 02:00:00 PM",
    processingTimeDays: 0.9,
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Machine-readable FHIR JSON bundle export of all outpatient encounter records.",
    dpoResolutionNotes: "Generated FHIR R4 Bundle zip artifact and made available in patient portal.",
    statutoryClause: "Section 11(2) Right to Data Portability & Machine-Readable Export",
    history: [
      { state: "Submitted", timestamp: "2026-09-08 04:00:00 PM", actor: "Ramesh Reddy" },
      { state: "Under Review", timestamp: "2026-09-09 09:00:00 AM", actor: "DPO Desk" },
      { state: "Approved", timestamp: "2026-09-09 11:00:00 AM", actor: "Adv. Meenakshi Sundaram" },
      { state: "Completed", timestamp: "2026-09-09 02:00:00 PM", actor: "Adv. Meenakshi Sundaram" },
    ],
  },
  {
    requestId: "DPDP-REQ-2026-906",
    tenantId: "TNT-9014",
    tenantName: "Apollo Super Speciality Hospital",
    dataPrincipalName: "Kavya Menon",
    dataPrincipalEmail: "kavya.m@gmail.com",
    dataPrincipalPhone: "+91 94444 33221",
    dataPrincipalCategory: "PATIENT",
    requestType: "Data Deletion Request",
    workflowState: "Rejected",
    submittedDate: "2026-09-02 01:00:00 PM",
    slaDueDate: "2026-09-09 01:00:00 PM",
    completedDate: "2026-09-04 10:00:00 AM",
    processingTimeDays: 1.8,
    assignedDpo: "Adv. Meenakshi Sundaram (DPO)",
    requestSummary: "Request to delete active inpatient surgical encounter notes and anesthesia charts.",
    dpoResolutionNotes: "Request rejected under NMC Guidelines 2002 statutory mandatory 10-year retention rule for surgical records.",
    statutoryClause: "Section 12(3) Statutory Retention Exemption Override",
    history: [
      { state: "Submitted", timestamp: "2026-09-02 01:00:00 PM", actor: "Kavya Menon" },
      { state: "Under Review", timestamp: "2026-09-03 09:00:00 AM", actor: "Legal Compliance Desk" },
      { state: "Rejected", timestamp: "2026-09-04 10:00:00 AM", actor: "Adv. Meenakshi Sundaram", notes: "Statutory 10-year retention override under NMC Guidelines." },
    ],
  },
];

const currentDpdpStore: DpdpPrincipalRequest[] = [...INITIAL_DPDP_REQUESTS];

export class DpdpCenterService {
  public static getRequests(params?: DpdpFilterParams): DpdpPrincipalRequest[] {
    if (!params) return currentDpdpStore;

    return currentDpdpStore.filter((r) => {
      if (params.tenantId && params.tenantId !== "ALL" && r.tenantId !== params.tenantId) {
        return false;
      }
      if (params.requestType && params.requestType !== "ALL" && r.requestType !== params.requestType) {
        return false;
      }
      if (params.workflowState && params.workflowState !== "ALL" && r.workflowState !== params.workflowState) {
        return false;
      }
      if (params.searchTerm) {
        const term = params.searchTerm.toLowerCase();
        const matchesId = r.requestId.toLowerCase().includes(term);
        const matchesName = r.dataPrincipalName.toLowerCase().includes(term);
        const matchesEmail = r.dataPrincipalEmail.toLowerCase().includes(term);
        const matchesSummary = r.requestSummary.toLowerCase().includes(term);
        if (!matchesId && !matchesName && !matchesEmail && !matchesSummary) {
          return false;
        }
      }
      return true;
    });
  }

  public static getMetrics(tenantId?: string): DpdpMetrics {
    const requests = this.getRequests({ tenantId });
    const totalRequestCount = requests.length;

    const stateCounts: Record<DpdpWorkflowState, number> = {
      Submitted: 0,
      "Under Review": 0,
      Approved: 0,
      Rejected: 0,
      Completed: 0,
    };

    let totalCompletedDays = 0;
    let completedCount = 0;

    requests.forEach((r) => {
      stateCounts[r.workflowState] = (stateCounts[r.workflowState] || 0) + 1;
      if (r.processingTimeDays !== undefined) {
        totalCompletedDays += r.processingTimeDays;
        completedCount++;
      }
    });

    const openRequestsCount = stateCounts.Submitted + stateCounts["Under Review"];
    const avgProcessingTimeDays = completedCount > 0 ? parseFloat((totalCompletedDays / completedCount).toFixed(1)) : 1.8;
    const slaComplianceRate = 98.5; // Mock SLA score %

    return {
      totalRequestCount,
      openRequestsCount,
      slaComplianceRate,
      avgProcessingTimeDays,
      stateCounts,
    };
  }

  public static updateRequestWorkflowState(
    requestId: string,
    newState: DpdpWorkflowState,
    actor: string,
    notes: string
  ): DpdpPrincipalRequest {
    const index = currentDpdpStore.findIndex((r) => r.requestId === requestId);
    if (index === -1) {
      throw new Error(`Request ${requestId} not found`);
    }

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const existing = currentDpdpStore[index];
    const allowedTransitions: Record<DpdpWorkflowState, DpdpWorkflowState[]> = {
      "Submitted": ["Under Review"],
      "Under Review": ["Approved", "Rejected"],
      "Approved": ["Completed"],
      "Rejected": [],
      "Completed": [],
    };

    if (!allowedTransitions[existing.workflowState].includes(newState)) {
      throw new Error(
        `Invalid DPDP workflow transition: "${existing.workflowState}" -> "${newState}".`
      );
    }

    if (!notes.trim()) {
      throw new Error("DPO resolution and audit justification notes are required.");
    }

    let completedDate = existing.completedDate;
    let processingTimeDays = existing.processingTimeDays;

    if (newState === "Completed" || newState === "Rejected") {
      completedDate = timestamp;
      processingTimeDays = 1.5;
    }

    const updated: DpdpPrincipalRequest = {
      ...existing,
      workflowState: newState,
      completedDate,
      processingTimeDays,
      dpoResolutionNotes: notes || existing.dpoResolutionNotes,
      history: [
        ...existing.history,
        {
          state: newState,
          timestamp,
          actor,
          notes,
        },
      ],
    };

    currentDpdpStore[index] = updated;

    if (newState === "Completed") {
      GovernanceEventBus.emit({
        eventType: "DPDP_REQUEST_COMPLETED",
        tenantId: updated.tenantId,
        tenantName: updated.tenantName,
        actor,
        actorRole: "DPDP_OFFICER",
        action: `Completed DPDP ${updated.requestType} Request (${updated.requestId})`,
        details: { requestId: updated.requestId, principalName: updated.dataPrincipalName, notes },
        riskLevel: "INFO",
      });
    }

    return updated;
  }

  public static exportCSV(tenantId?: string): string {
    const requests = this.getRequests({ tenantId });
    const headers = [
      "Request ID",
      "Tenant ID",
      "Data Principal Name",
      "Email",
      "Category",
      "Request Type",
      "Workflow State",
      "Submitted Date",
      "SLA Due Date",
      "Completed Date",
      "Processing Time (Days)",
      "Assigned DPO",
      "Statutory Clause",
      "Resolution Notes",
    ];

    const rows = requests.map((r) => [
      r.requestId,
      r.tenantId,
      `"${r.dataPrincipalName}"`,
      `"${r.dataPrincipalEmail}"`,
      r.dataPrincipalCategory,
      `"${r.requestType}"`,
      r.workflowState,
      `"${r.submittedDate}"`,
      `"${r.slaDueDate}"`,
      `"${r.completedDate || "N/A"}"`,
      r.processingTimeDays || "N/A",
      `"${r.assignedDpo}"`,
      `"${r.statutoryClause}"`,
      `"${(r.dpoResolutionNotes || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  public static exportJSON(tenantId?: string): string {
    const requests = this.getRequests({ tenantId });
    return JSON.stringify(requests, null, 2);
  }
}
