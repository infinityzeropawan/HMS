import {
  PermissionClaim,
  RoleDefinition,
  PermissionCategory,
} from "../_super_admin_types/rbac_management";

export const PERMISSION_CLAIMS: PermissionClaim[] = [
  // --- Clinical OPD ---
  { id: "opd:queue:read", name: "View OPD Queue & Appointments", description: "View outpatient queue, token lists, and doctor appointment rosters", category: "Clinical OPD", requiredFeatureId: "FEAT-CLIN-OPD" },
  { id: "opd:encounter:read", name: "Read Patient OPD Encounters", description: "Read outpatient medical history, past prescriptions, and clinical notes", category: "Clinical OPD", requiredFeatureId: "FEAT-CLIN-OPD" },
  { id: "opd:encounter:write", name: "Create & Edit OPD Encounters", description: "Write doctor notes, record vitals, diagnosis, and order treatments", category: "Clinical OPD", requiredFeatureId: "FEAT-CLIN-OPD" },
  { id: "opd:prescription:create", name: "Generate e-Prescriptions", description: "Prescribe medicines, dosage instructions, and brand/generic substitutes", category: "Clinical OPD", requiredFeatureId: "FEAT-CLIN-OPD" },
  { id: "opd:telehealth:consult", name: "Conduct Telehealth Video Calls", description: "Initiate and participate in remote virtual consultations", category: "Clinical OPD", requiredFeatureId: "FEAT-CLIN-TELEMEDICINE" },

  // --- Inpatient Care (IPD) ---
  { id: "ipd:admissions:read", name: "View Inpatient Admissions", description: "Access ward bed roster, active inpatient lists, and admission logs", category: "Inpatient Care (IPD)", requiredFeatureId: "FEAT-CLIN-IPD" },
  { id: "ipd:admissions:write", name: "Admit & Transfer Inpatients", description: "Process IPD admissions, bed transfers, and ward assignments", category: "Inpatient Care (IPD)", requiredFeatureId: "FEAT-CLIN-IPD" },
  { id: "ipd:rounds:write", name: "Write Daily Clinical Rounds Notes", description: "Record daily ward doctor progress notes and order revisions", category: "Inpatient Care (IPD)", requiredFeatureId: "FEAT-CLIN-IPD" },
  { id: "ipd:mar:execute", name: "Execute MAR Medication Administration", description: "Administer prescribed drugs and mark Medication Administration Record (MAR)", category: "Inpatient Care (IPD)", requiredFeatureId: "FEAT-CLIN-IPD" },
  { id: "ipd:discharge:approve", name: "Approve Clinical Discharge", description: "Sign off clinical discharge summary and order home care instructions", category: "Inpatient Care (IPD)", requiredFeatureId: "FEAT-CLIN-IPD" },

  // --- Operation Theatre (OT) ---
  { id: "ot:schedule:read", name: "View Surgical Rosters", description: "View OT table schedules, surgeon rosters, and PAC clearance status", category: "Operation Theatre (OT)", requiredFeatureId: "FEAT-CLIN-OT" },
  { id: "ot:schedule:write", name: "Book & Reschedule OT Surgeries", description: "Schedule surgical procedures, allocate OT suites, and assign surgical teams", category: "Operation Theatre (OT)", requiredFeatureId: "FEAT-CLIN-OT" },
  { id: "ot:pac:approve", name: "Approve Pre-Anesthesia Clearance (PAC)", description: "Conduct PAC evaluation and grant surgical fitness clearance", category: "Operation Theatre (OT)", requiredFeatureId: "FEAT-CLIN-OT" },
  { id: "ot:intraop:nurse", name: "Record Intra-Op Surgical Nurse Logs", description: "Log scrub nurse timers, implant usage, swab counts, and anesthesia charts", category: "Operation Theatre (OT)", requiredFeatureId: "FEAT-CLIN-OT" },

  // --- Pharmacy & Dispensing ---
  { id: "pharmacy:dispense:read", name: "View Dispensing Orders", description: "View pending OPD and IPD pharmacy prescription orders", category: "Pharmacy & Dispensing", requiredFeatureId: "FEAT-CLIN-PHARM" },
  { id: "pharmacy:dispense:write", name: "Dispense Prescription Medicines", description: "Execute FEFO batch selection, label printing, and medicine handing to patient", category: "Pharmacy & Dispensing", requiredFeatureId: "FEAT-CLIN-PHARM" },
  { id: "pharmacy:controlled:dispense", name: "Dispense Narcotic & Controlled Drugs", description: "Dispense Schedule H/X narcotic drugs requiring dual authorization", category: "Pharmacy & Dispensing", requiredFeatureId: "FEAT-CLIN-PHARM" },
  { id: "pharmacy:stock:audit", name: "Perform Stock Audit & Expiry Management", description: "Manage drug inventory adjustments, batch expiry flags, and supplier returns", category: "Pharmacy & Dispensing", requiredFeatureId: "FEAT-CLIN-PHARM" },

  // --- Pathology & Diagnostics ---
  { id: "lab:orders:read", name: "View Laboratory Test Orders", description: "Access pending diagnostic requisitions and panic value alerts", category: "Pathology & Diagnostics", requiredFeatureId: "FEAT-CLIN-LAB" },
  { id: "lab:specimen:collect", name: "Collect & Barcode Specimen Samples", description: "Print vacutainer barcodes and mark specimen collection status", category: "Pathology & Diagnostics", requiredFeatureId: "FEAT-CLIN-LAB" },
  { id: "lab:results:entry", name: "Enter Lab Test Parameters", description: "Input analyzer values and technician observations", category: "Pathology & Diagnostics", requiredFeatureId: "FEAT-CLIN-LAB" },
  { id: "lab:results:signoff", name: "Validate & Release Pathology Reports", description: "Pathologist sign-off and public release of lab results to patient portal", category: "Pathology & Diagnostics", requiredFeatureId: "FEAT-CLIN-LAB" },

  // --- Billing & Financials ---
  { id: "billing:invoice:create", name: "Generate Invoices & Estimates", description: "Create OPD consultation bills, IPD advance receipts, and final bills", category: "Billing & Financials", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "billing:discount:approve", name: "Approve Billing Discounts & Waivers", description: "Grant tariff discounts, charity waivers, and fee adjustments", category: "Billing & Financials", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "billing:tpa:claims", name: "Process Insurance TPA Pre-Auth & Claims", description: "Submit TPA claim packages, track cash-less authorization, and claim settle", category: "Billing & Financials", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "billing:payouts:manage", name: "Manage Doctor Payouts & Commission Roster", description: "Calculate doctor fee split ratios and release payout vouchers", category: "Billing & Financials", requiredFeatureId: "FEAT-BUS-BILLING" },

  // --- Integrations & ABDM ---
  { id: "abdm:healthid:link", name: "Create & Link ABHA Health ID", description: "Verify patient ABHA number via Aadhaar OTP and generate ABHA card", category: "Integrations & ABDM", requiredFeatureId: "FEAT-INT-ABDM" },
  { id: "abdm:gateway:push", name: "Push Health Records to ABDM Gateway", description: "Bundle FHIR clinical artifacts and upload to ABDM Health Information Exchange", category: "Integrations & ABDM", requiredFeatureId: "FEAT-INT-ABDM" },
  { id: "pacs:dicom:view", name: "Access PACS DICOM Medical Imaging", description: "Open web-based DICOM viewer to inspect X-Rays, CT Scans, and MRI studies", category: "Integrations & ABDM", requiredFeatureId: "FEAT-PREM-AI" },

  // --- System Administration ---
  { id: "admin:staff:manage", name: "Manage Hospital Staff & User Credentials", description: "Create staff accounts, assign roles, reset passwords, and toggle active status", category: "System Administration", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "admin:rbac:configure", name: "Configure Custom Roles & Scope Rules", description: "Modify custom role definitions, permissions, and shift roster policies", category: "System Administration", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "admin:tariff:manage", name: "Manage Hospital Service Tariff Masters", description: "Update price lists, room tariffs, and procedure rates", category: "System Administration", requiredFeatureId: "FEAT-BUS-BILLING" },
  { id: "admin:audit:view", name: "View DPDP Compliance Audit Ledger", description: "Inspect tamper-proof hash-chained data access and consent audit logs", category: "System Administration", requiredFeatureId: "FEAT-BUS-ANALYTICS" },
];

export const GLOBAL_ROLE_TEMPLATES: RoleDefinition[] = [
  {
    id: "TMPL-DOC",
    name: "Doctor",
    description: "Standard outpatient physician role for OPD consultation, e-prescriptions, and EHR notes",
    category: "Clinical",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "pacs:dicom:view"],
    scopeRules: { scopeType: "Care Team Assigned Only", allowedDepartments: ["ALL"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-SR-DOC",
    name: "Senior Doctor",
    description: "Senior attending physician with IPD rounds, OT booking, and PAC clearance privileges",
    category: "Clinical",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-DOC",
    tenantId: "GLOBAL",
    permissions: [
      "opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "opd:telehealth:consult",
      "ipd:admissions:read", "ipd:rounds:write", "ipd:discharge:approve",
      "ot:schedule:read", "ot:schedule:write", "ot:pac:approve", "pacs:dicom:view"
    ],
    scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["ALL"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-CONSULTANT",
    name: "Consultant",
    description: "Visiting specialist / chief consultant with cross-department consultation & telemetry view",
    category: "Clinical",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-SR-DOC",
    tenantId: "GLOBAL",
    permissions: [
      "opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "opd:telehealth:consult",
      "ipd:admissions:read", "ipd:rounds:write", "ipd:discharge:approve",
      "ot:schedule:read", "ot:schedule:write", "ot:pac:approve", "pacs:dicom:view", "abdm:gateway:push"
    ],
    scopeRules: { scopeType: "Branch Network", allowedDepartments: ["ALL"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-RESIDENT-DOC",
    name: "Resident Doctor",
    description: "Junior resident doctor assisting in ward rounds, preliminary notes, and orders",
    category: "Clinical",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-DOC",
    tenantId: "GLOBAL",
    permissions: ["opd:queue:read", "opd:encounter:read", "opd:encounter:write", "opd:prescription:create", "ipd:admissions:read", "ipd:rounds:write"],
    scopeRules: { scopeType: "Ward Scoped", allowedDepartments: ["ALL"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-NURSE",
    name: "Nurse",
    description: "Bedside staff nurse for vital signs recording, MAR execution, and ward care",
    category: "Nursing",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["ipd:admissions:read", "ipd:mar:execute"],
    scopeRules: { scopeType: "Ward Scoped", allowedDepartments: ["Nursing"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-HEAD-NURSE",
    name: "Head Nurse",
    description: "Ward charge nurse managing nurse duty rosters, bed allocations, and discharge prep",
    category: "Nursing",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-NURSE",
    tenantId: "GLOBAL",
    permissions: ["ipd:admissions:read", "ipd:admissions:write", "ipd:mar:execute", "ot:intraop:nurse"],
    scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["Nursing", "ICU"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-ICU-NURSE",
    name: "ICU Nurse",
    description: "Specialized critical care nurse for ventilator beds, telemetry monitors & critical alarms",
    category: "Nursing",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-NURSE",
    tenantId: "GLOBAL",
    permissions: ["ipd:admissions:read", "ipd:mar:execute", "ot:intraop:nurse", "pacs:dicom:view"],
    scopeRules: { scopeType: "Ward Scoped", allowedDepartments: ["ICU", "CCU"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-RECEPTIONIST",
    name: "Receptionist",
    description: "Front desk executive for patient registration, appointment booking & ABHA creation",
    category: "Front Desk",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["opd:queue:read", "abdm:healthid:link"],
    scopeRules: { scopeType: "Tenant Wide", allowedDepartments: ["Front Office"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-BILLING-EXEC",
    name: "Billing Executive",
    description: "Accounts cashier for OPD consultation invoices, IPD advance billing & cash collection",
    category: "Billing",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["billing:invoice:create"],
    scopeRules: { scopeType: "Tenant Wide", allowedDepartments: ["Finance"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-BILLING-SUP",
    name: "Billing Supervisor",
    description: "Finance manager approving billing discounts, TPA insurance pre-auth & doctor payouts",
    category: "Billing",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-BILLING-EXEC",
    tenantId: "GLOBAL",
    permissions: ["billing:invoice:create", "billing:discount:approve", "billing:tpa:claims", "billing:payouts:manage"],
    scopeRules: { scopeType: "Tenant Wide", allowedDepartments: ["Finance"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-LAB-TECH",
    name: "Lab Technician",
    description: "Pathology technician collecting specimens and logging lab result parameters",
    category: "Diagnostics",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["lab:orders:read", "lab:specimen:collect", "lab:results:entry"],
    scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["Pathology"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-LAB-MGR",
    name: "Lab Manager",
    description: "Pathology chief validating lab test results, signing off diagnostic reports",
    category: "Diagnostics",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-LAB-TECH",
    tenantId: "GLOBAL",
    permissions: ["lab:orders:read", "lab:specimen:collect", "lab:results:entry", "lab:results:signoff"],
    scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["Pathology"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-PHARMACIST",
    name: "Pharmacist",
    description: "Licensed chemist for e-prescription dispensing and medicine stock management",
    category: "Pharmacy",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["pharmacy:dispense:read", "pharmacy:dispense:write"],
    scopeRules: { scopeType: "Department Scoped", allowedDepartments: ["Pharmacy"], requiresOnDutyRoster: true, allowEmergencyBreakGlass: false },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-CHIEF-PHARMACIST",
    name: "Chief Pharmacist",
    description: "Pharmacy manager authorizing narcotic Schedule X drugs and inventory audits",
    category: "Pharmacy",
    isGlobalTemplate: true,
    parentTemplateId: "TMPL-PHARMACIST",
    tenantId: "GLOBAL",
    permissions: ["pharmacy:dispense:read", "pharmacy:dispense:write", "pharmacy:controlled:dispense", "pharmacy:stock:audit"],
    scopeRules: { scopeType: "Tenant Wide", allowedDepartments: ["Pharmacy"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-HOSP-ADMIN",
    name: "Hospital Administrator",
    description: "Tenant hospital admin managing staff accounts, department setups, tariffs & audit logs",
    category: "Governance",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: ["admin:staff:manage", "admin:rbac:configure", "admin:tariff:manage", "admin:audit:view", "abdm:healthid:link", "abdm:gateway:push"],
    scopeRules: { scopeType: "Tenant Wide", allowedDepartments: ["ALL"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "System Master",
  },
  {
    id: "TMPL-SUPER-ADMIN",
    name: "Super Admin",
    description: "Platform master governance controlling multi-tenant SaaS features, subscription plans & audit",
    category: "Governance",
    isGlobalTemplate: true,
    parentTemplateId: null,
    tenantId: "GLOBAL",
    permissions: PERMISSION_CLAIMS.map((p) => p.id),
    scopeRules: { scopeType: "Branch Network", allowedDepartments: ["ALL"], requiresOnDutyRoster: false, allowEmergencyBreakGlass: true },
    status: "Active",
    updatedAt: "2026-09-01",
    updatedBy: "Platform Core",
  },
];

export class RbacCatalogService {
  static getAllPermissions(): PermissionClaim[] {
    return PERMISSION_CLAIMS;
  }

  static getPermissionById(id: string): PermissionClaim | undefined {
    return PERMISSION_CLAIMS.find((p) => p.id === id);
  }

  static getGlobalTemplates(): RoleDefinition[] {
    return GLOBAL_ROLE_TEMPLATES;
  }

  static getTemplateById(id: string): RoleDefinition | undefined {
    return GLOBAL_ROLE_TEMPLATES.find((t) => t.id === id);
  }
}
