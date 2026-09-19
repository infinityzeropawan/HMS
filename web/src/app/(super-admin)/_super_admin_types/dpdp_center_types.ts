export type DpdpRequestType =
  | "Data Access Request"
  | "Data Correction Request"
  | "Data Export Request"
  | "Data Deletion Request"
  | "Consent Withdrawal Request";

export type DpdpWorkflowState =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Completed";

export interface DpdpWorkflowHistoryEvent {
  state: DpdpWorkflowState;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface DpdpPrincipalRequest {
  requestId: string; // e.g. DPDP-REQ-2026-901
  tenantId: string; // e.g. TNT-9014
  tenantName: string;
  dataPrincipalName: string; // Patient or Staff
  dataPrincipalEmail: string;
  dataPrincipalPhone: string;
  dataPrincipalCategory: "PATIENT" | "STAFF" | "DOCTOR";
  requestType: DpdpRequestType;
  workflowState: DpdpWorkflowState;
  submittedDate: string; // YYYY-MM-DD HH:mm:ss
  slaDueDate: string; // YYYY-MM-DD HH:mm:ss (7-day statutory limit)
  completedDate?: string; // YYYY-MM-DD HH:mm:ss
  processingTimeDays?: number; // Days taken to complete
  assignedDpo: string; // Data Protection Officer
  requestSummary: string; // Details of request
  dpoResolutionNotes?: string;
  verificationDocument?: string; // Proof document
  statutoryClause: string; // India DPDP Act 2023 Section reference
  history: DpdpWorkflowHistoryEvent[];
}

export interface DpdpMetrics {
  totalRequestCount: number;
  openRequestsCount: number;
  slaComplianceRate: number; // e.g. 98.5%
  avgProcessingTimeDays: number; // e.g. 1.8 days
  stateCounts: Record<DpdpWorkflowState, number>;
}

export interface DpdpFilterParams {
  searchTerm?: string;
  tenantId?: string;
  requestType?: DpdpRequestType | "ALL";
  workflowState?: DpdpWorkflowState | "ALL";
}
