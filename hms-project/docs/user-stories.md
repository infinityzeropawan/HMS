# User Stories by Role — Hospital Management System

<!-- Source: Extracted Section 13 Ownership Map and Role User Stories -->

## 1. Super Admin Role
- **US-SA-01**: As a Super Admin, I want to onboard new tenant hospitals and select their isolation mode (`shared_rls`, `dedicated_schema`, `dedicated_db`), so that new facilities are provisioned securely.
- **US-SA-02**: As a Super Admin, I want to manage global master catalogs (Drugs, ICD-10, SNOMED, LOINC), so that all clinical modules maintain standardized terminology.

---

## 2. Hospital Admin Role
- **US-HA-01**: As a Hospital Admin, I want to configure hospital settings, departments, wards, and bed capacity, so that hospital operations reflect physical infrastructure.
- **US-HA-02**: As a Hospital Admin, I want to define custom RBAC roles and permissions, so that staff access is granted on a strict need-to-know basis.

---

## 3. Receptionist / Front Desk Role
- **US-REC-01**: As a Receptionist, I want to search and register patients with demographic details and linked ABHA IDs, so that an automatic unique UHID is generated.
- **US-REC-02**: As a Receptionist, I want to book doctor appointments and generate sequential queue tokens, so that patient flow in OPD is managed efficiently.

---

## 4. Doctor Role
- **US-DOC-01**: As a Doctor, I want to view my OPD appointment queue and initiate clinical encounters, so that I can document chief complaints, vitals, and SOAP notes.
- **US-DOC-02**: As a Doctor, I want to select generic/brand drugs and issue signed e-Prescriptions, so that patients receive electronic dosage instructions.

---

## 5. Nurse Role
- **US-NUR-01**: As a Nurse, I want to log patient vitals, nursing progress notes, and Medication Administration Records (MAR), so that inpatient care is tracked accurately.
- **US-NUR-02**: As a Nurse, I want to execute digital shift handovers with structured patient summaries, so that clinical continuity is preserved across shift changes.

---

## 6. Pharmacist Role
- **US-PHA-01**: As a Pharmacist, I want to view active e-Prescriptions and dispense matching stock batches with FEFO (First-Expiry-First-Out) tracking, so that expired medicines are never sold.
- **US-PHA-02**: As a Pharmacist, I want to maintain the Controlled Drug Register for Schedule H/H1/X drugs, so that regulatory compliance is strictly maintained.

---

## 7. Laboratory & Radiology Tech Role
- **US-LAB-01**: As a Lab Tech, I want to receive lab orders, print sample barcodes, and enter verified test results, so that diagnostic reports are generated for doctors.
- **US-RAD-01**: As a Radiologist, I want to link DICOM studies from PACS and record diagnostic findings, so that imaging reports are attached to patient EMR.

---

## 8. Billing & TPA Admin Role
- **US-BIL-01**: As a Billing Admin, I want to generate itemized GST invoices with SAC/HSN codes and CGST/SGST/IGST breakdown, so that tax compliance is ensured.
- **US-BIL-02**: As a TPA Executive, I want to log insurance pre-authorizations and track claim settlement workflows, so that cashless hospitalizations are processed smoothly.

---

## 9. Compliance Officer / DPO Role
- **US-DPO-01**: As a DPO, I want to track digital consent artifacts and maintain immutable audit logs for all patient PII access, so that DPDP Act 2023 compliance is auditable.
