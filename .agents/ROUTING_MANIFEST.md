# HMS Routing Manifest

Verification map for documented HMS application routes. Do not invent routes from this file.

## Auth
/auth/login
/auth/forgot-password

## Role redirects
- super_admin -> /super-admin/tenants
- hospital_admin -> /hospital-admin/dashboard
- doctor -> /doctor/dashboard
- receptionist -> /reception/dashboard
- nurse -> /nurse/dashboard
- pharmacist -> /pharmacy/dashboard
- lab_tech -> /lab/dashboard
- billing -> /billing/dashboard
- patient -> /patient-portal/my-records

## Super Admin
/super-admin/tenants
/super-admin/tenants/[id]
/super-admin/subscriptions
/super-admin/feature-flags
/super-admin/global-masters/drugs
/super-admin/global-masters/icd10
/super-admin/global-masters/snomed
/super-admin/global-masters/loinc
/super-admin/global-masters/lab-tests
/super-admin/audit-logs
/super-admin/support-tickets

## Hospital Admin
/hospital-admin/dashboard
/hospital-admin/settings
/hospital-admin/departments
/hospital-admin/wards
/hospital-admin/beds
/hospital-admin/users
/hospital-admin/users/[id]
/hospital-admin/roles
/hospital-admin/print-templates
/hospital-admin/accreditations

## Reception
/reception/dashboard
/reception/registration
/reception/registration/[uhid]
/reception/appointments
/reception/appointments/new
/reception/queue
/reception/token-display

## Doctor
/doctor/dashboard
/doctor/opd-queue
/doctor/encounter/[id]
/doctor/encounter/[id]/vitals
/doctor/encounter/[id]/soap
/doctor/encounter/[id]/diagnosis
/doctor/encounter/[id]/prescription
/doctor/encounter/[id]/referral
/doctor/teleconsult/[id]
/doctor/payout-summary

## Nurse
/nurse/dashboard
/nurse/ward-view
/nurse/patient/[admissionId]/vitals
/nurse/patient/[admissionId]/mar
/nurse/patient/[admissionId]/nursing-notes
/nurse/patient/[admissionId]/diet
/nurse/shift-handover

## OT
/ot/schedule
/ot/bookings/[id]
/ot/checklist/[id]

## Pharmacy
/pharmacy/dashboard
/pharmacy/dispense
/pharmacy/inventory
/pharmacy/stock-batches
/pharmacy/purchase-orders
/pharmacy/controlled-drugs

## Lab and Radiology
/lab/dashboard
/lab/orders
/lab/sample-collection
/lab/result-entry/[orderId]
/lab/report-view/[reportId]
/radiology/orders
/radiology/report-entry/[orderId]

## Billing
/billing/dashboard
/billing/invoices
/billing/invoices/new
/billing/invoices/[id]
/billing/payments
/billing/tpa-claims
/billing/tpa-claims/[id]
/billing/discount-approvals
/billing/gst-reports

## HR
/hr/staff
/hr/shifts
/hr/rosters
/hr/leave
/hr/attendance
/hr/payroll

## Compliance
/compliance/audit-logs
/compliance/consents
/compliance/dpdp-report

## Patient portal
/patient-portal/my-records
/patient-portal/appointments
/patient-portal/prescriptions
/patient-portal/abha-link

## Verification rule
For every internal action: resolve target, verify actual repo route, verify dynamic parameters, verify authentication/RBAC, verify semantic destination, and record discrepancies rather than hiding them by inventing a route.