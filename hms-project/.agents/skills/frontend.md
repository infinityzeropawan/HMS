# SKILL: Frontend UI/UX Conventions & Design Standards

<!-- Source: Extracted UI conventions, pages to scaffold, print templates, PWA guidance -->

## 1. UI Tech Stack & Component Library
- **Framework**: React + TypeScript + Next.js.
- **Component Library**: Ant Design (`antd`) with custom theme tokens.

## 2. Core Pages to Scaffold
1. `/auth/login`: Staff and doctor authentication.
2. `/reception/registration`: Patient UHID registration and ABHA linkage.
3. `/reception/appointments`: OPD queue management and token generation.
4. `/doctor/dashboard`: Doctor appointment queue & active encounter chart.
5. `/emr/encounter/[id]`: Clinical SOAP notes, ICD-10 diagnosis selector, e-Prescription builder.
6. `/billing/invoices`: GST invoice generator and payment collection.
7. `/pharmacy/dispense`: Prescription dispensing and batch stock verification.

## 3. i18n & Language Fallback Policy
- System primary language is English (`en`).
- Provide Hindi (`hi`) and regional language fallbacks for patient portal and print templates.

## 4. Print Templates Rules
- Prescriptions, invoices, lab reports, and discharge summaries MUST render via print templates stored in `print_templates` table.
- HTML layout must support standard A4 and thermal receipt paper sizes (80mm).

## 5. Form & PWA Guidance
- **Aadhaar Masking**: Form inputs must mask Aadhaar numbers (`XXXX-XXXX-1234`).
- **Required Fields Indicator**: Mark required clinical inputs clearly.
- **Offline PWA Capability**: Support local IndexedDB caching for offline mobile rounds in case of network drops.
