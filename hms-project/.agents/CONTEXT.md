# HMS Project Context & Architecture Master File

> **LAST UPDATED**: 2026-09-08  
> **STATUS**: Phases 1, 2, 3, and 4 Complete & Verified (29 Production Routes). Phase 5 Ready.

---

## 1. Directory & Workspace Mapping

- **Frontend Web Application**: [`/home/pawan/Desktop/hospital/web`](file:///home/pawan/Desktop/hospital/web) (Next.js 15 App Router, React 19, TypeScript, Ant Design, TailwindCSS, TanStack Query, Zustand, Zod).
- **Backend Service**: [`/home/pawan/Desktop/hospital/hms-backend`](file:///home/pawan/Desktop/hospital/hms-backend) (NestJS, Prisma, PostgreSQL RLS, Redis).
- **Mobile Application**: [`/home/pawan/Desktop/hospital/hms_flutter`](file:///home/pawan/Desktop/hospital/hms_flutter) (Flutter, Dart, Clean Architecture).
- **Project Governance & Agent Rules**: [`/home/pawan/Desktop/hospital/hms-project/.agents`](file:///home/pawan/Desktop/hospital/hms-project/.agents) and [`/home/pawan/Desktop/hospital/.agents`](file:///home/pawan/Desktop/hospital/.agents).

---

## 2. Completed Phase Summary & Route Registry

| Phase | Domain / Modules | Routes Implemented & Verified | Key Features & Compliance |
|---|---|---|---|
| **Phase 1** | Core OPD, Auth, Billing, Pharmacy, Lab | `/login`<br>`/dashboard`<br>`/patients/register`<br>`/queue`<br>`/encounter/[id]`<br>`/invoices`<br>`/dispense`<br>`/orders` | Multi-tenant auth + 2FA, 3-step registration with masked Aadhaar (`XXXX-XXXX-1234`), 3-pane encounter workspace, eRx signature print lock, FEFO pharmacy batch allocation, lab panic value alerts (<7.0 g/dL Hb). |
| **Phase 2** | IPD, Nursing, OT, Admin, Patient Portal | `/station`<br>`/mar/[ipdId]`<br>`/wards`<br>`/discharge/[ipdId]`<br>`/schedule`<br>`/users`<br>`/tariffs`<br>`/audit-logs`<br>`/portal` | Nursing bed matrix grid, hourly vitals flowsheet, barcode MAR checklist, ABDM M3 discharge summary with digital signature lock, OT surgery scheduler & pre-op anesthesia checklist, RBAC user admin, tariff editor, DPDP immutable audit log viewer, patient portal with consent manager. |
| **Phase 3** | Super Admin, Analytics, HR, Assets, Telehealth | `/tenants`<br>`/revenue`<br>`/inventory`<br>`/roster`<br>`/payouts`<br>`/equipment`<br>`/consult/[sessionNo]` | Multi-tenant hospital onboarding wizard, subscription SLA manager, OPD/IPD revenue analytics, stock expiry forecasting, staff duty roster, doctor OPD & surgery commission calculator, biomedical asset calibration & maintenance, WebRTC encrypted video consult room with IoT telemetry. |
| **Phase 4** | Ecosystem & Advanced Integrations | `/gateway`<br>`/alerts`<br>`/checkin`<br>`/viewer/[studyId]`<br>`/transfers` | ABDM M1/M2/M3 FHIR record exchange & UHI booking protocol, real-time CDSS drug-allergy/interaction warnings & NEWS2 sepsis calculator, self check-in kiosk UI with simulated ABHA scanner, Web PACS DICOM viewer (zoom/pan/invert/metadata), inter-hospital branch patient transfers & central warehouse sync. |
| **Phase 5** | i18n, PWA Sync, a11y, Performance | *Planned* | Multi-language switcher (EN, HI, MR, TA, TE, BN), IndexedDB offline sync queue, WCAG 2.1 AA keyboard shortcuts (`Ctrl+Alt+S`), production performance optimization. |

---

## 3. Strict Compliance & Architecture Audit Results

- **TypeScript Compilation**: `npx tsc --noEmit` &rarr; **0 Errors**.
- **ESLint Analysis**: `npm run lint` &rarr; **0 Warnings, 0 Errors**.
- **Next.js Production Build**: `npm run build` &rarr; **29/29 routes compiled & rendered statically/dynamically**.
- **Line Count Ceiling**: Max component line count is 123 lines (Ceiling limit: 300 lines).
- **Private Subfolder Prefixing**: 100% of internal components live in leading-underscore private subfolders (`_auth_components`, `_reception_components`, `_doctor_components`, `_billing_components`, `_pharmacy_components`, `_lab_components`, `_nurse_components`, `_ipd_components`, `_ot_components`, `_admin_components`, `_patient_components`, `_super_admin_components`, `_analytics_components`, `_hr_components`, `_assets_components`, `_telehealth_components`, `_abdm_components`, `_cdss_components`, `_kiosk_components`, `_pacs_components`, `_network_components`).
- **Aadhaar Masking (DPDP Act 2023)**: Masked input/display `XXXX-XXXX-1234` strictly enforced across all patient components.
- **AI Clinical Guidance**: `<HmsAiGeneratedBadge />` attached to AI-suggested notes with print lock until signed.
- **GST Invoicing**: CGST 9% + SGST 9% split using `NUMERIC(12,2)` precision.

---

## 4. Operational Rules for Development

1. Always run commands from `/home/pawan/Desktop/hospital/web` using Node v20 (`export PATH=/home/pawan/.nvm/versions/node/v20.20.1/bin:$PATH`).
2. Never import cross-role components directly; duplicate or keep in role-isolated sub-folders.
3. Keep shared visual primitives in `src/common_components/`.
4. Validate all external inputs with Zod schemas.
