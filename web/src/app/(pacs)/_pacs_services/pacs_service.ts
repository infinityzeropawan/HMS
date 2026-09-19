import { usePacsStore, RadiologyStudy, RadiologyReportFormValues } from "../_pacs_stores/pacs_store";
import { RadiologyOrderInput } from "@/app/(doctor)/_doctor_types/encounter_types";
import { useTariffStore } from "@/app/(admin)/_admin_stores/admin_tariff_store";
import { useBillingStore } from "@/app/(billing)/_billing_stores/billing_store";
import { useIpdStore } from "@/app/(ipd)/_ipd_stores/ipd_store";
import { useNotificationStore } from "@/lib/notification_store/notification.store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export class PacsService {
  /**
   * Dispatches a radiology order from doctor encounter into PACS worklist & billing master
   */
  static dispatchOrderFromEncounter(
    uhid: string,
    patientName: string,
    doctorName: string,
    order: RadiologyOrderInput
  ): RadiologyStudy {
    // 1. Determine modality enum for PACS
    let modality: RadiologyStudy["modality"] = "CR";
    if (order.modality === "CT") modality = "CT";
    else if (order.modality === "MRI") modality = "MRI";
    else if (order.modality === "ULTRASOUND") modality = "US";
    else if (order.modality === "ECG") modality = "ECG";
    else if (order.modality === "XRAY") modality = "CR";

    // 2. Lookup tariff rate from TariffStore or default map
    const tariffs = useTariffStore.getState().tariffs;
    const matchingTariff = tariffs.find(
      (t) =>
        t.category === "RADIOLOGY" &&
        (t.serviceName.toLowerCase().includes(order.studyName.toLowerCase()) ||
          t.serviceCode.toLowerCase().includes(modality.toLowerCase()))
    );

    let price = matchingTariff?.baseRate || 500;
    if (!matchingTariff) {
      if (modality === "MRI") price = 6500;
      else if (modality === "CT") price = 3500;
      else if (modality === "US") price = 1200;
      else if (modality === "ECG") price = 450;
      else price = 500;
    }

    const studyId = `STD-${Math.floor(9000 + Math.random() * 1000)}`;

    // Resolve active IPD admission if present
    const admissions = useIpdStore.getState().admissions;
    const admission = admissions.find((a) => a.uhid === uhid || a.patientName === patientName);

    // 3. Create invoice in BillingStore
    let invoiceNumber = "";
    try {
      const inv = useBillingStore.getState().addInvoice({
        invoiceNumber: `INV-RAD-${Math.floor(10000 + Math.random() * 90000)}`,
        patientUhid: uhid,
        patientName: patientName || "OPD Patient",
        category: "LAB",
        items: [
          {
            itemId: `rad-${Date.now()}`,
            description: `[PACS-RAD] ${order.studyName} (${modality})`,
            hsnSacCode: matchingTariff?.hsnSacCode || "999313",
            quantity: 1,
            unitPrice: price,
            gstRate: matchingTariff?.gstRate || 0,
          },
        ],
        paymentMode: "CASH",
        subtotal: price,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: price,
        paidAmount: price,
        status: "PAID",
      });
      invoiceNumber = inv.invoiceNumber;
    } catch {
      /* non-blocking */
    }

    // 4. Add Study to usePacsStore
    const newStudy = usePacsStore.getState().addStudy({
      studyId,
      patientName: patientName || "OPD Patient",
      uhid,
      ipdId: admission?.admissionNo,
      bedNumber: admission?.bedNumber,
      modality,
      bodyPart: order.bodyPart || order.studyName,
      referringDoctor: doctorName || "Dr. Rajesh Sharma",
      radiologist: "Dr. Vikram Seth (MD Rad)",
      priority: order.urgency || "ROUTINE",
      status: "ORDERED",
      date: new Date().toLocaleString(),
      imagesCount: modality === "CT" ? 140 : modality === "MRI" ? 280 : 2,
      clinicalNotes: order.clinicalNotes,
      price,
      invoiceNumber,
    });

    return newStudy;
  }

  /**
   * Finalizes radiologist report and syncs with doctor review inbox, EMR timeline, and audit logs
   */
  static finalizeReport(studyId: string, reportValues: RadiologyReportFormValues): void {
    // 1. Finalize in PACS store
    usePacsStore.getState().finalizeReport(studyId, reportValues);

    const study = usePacsStore.getState().getStudyById(studyId);
    if (!study) return;

    const timestamp = new Date().toLocaleString();

    // 2. Task 2: EMR Timeline Integration via useIpdStore.addRoundNote
    const admissions = useIpdStore.getState().admissions;
    const targetAdmission = admissions.find((a) => a.uhid === study.uhid || a.admissionNo === study.ipdId);
    const ipdId = targetAdmission?.admissionNo || study.ipdId || admissions[0]?.admissionNo || "IPD-2026-0881";

    try {
      useIpdStore.getState().addRoundNote(
        ipdId,
        `[RADIOLOGY VERIFIED] ${study.modality} Scan: ${study.bodyPart} (Study ID: ${study.studyId}) - Signed by ${reportValues.radiologist} at ${timestamp}. Impression: ${reportValues.impression || "No acute abnormality detected."}`
      );
    } catch {
      /* store fallback */
    }

    // 3. Task 3: Critical Imaging Alerts for EMERGENCY or STAT studies
    const isCritical = study.priority === "EMERGENCY" || study.priority === "STAT" || reportValues.impression.toLowerCase().includes("panic") || reportValues.impression.toLowerCase().includes("critical");

    if (isCritical) {
      useNotificationStore.getState().addNotification({
        title: `CRITICAL IMAGING ALERT: ${study.patientName} (${study.uhid})`,
        body: `Bed ${study.bedNumber || targetAdmission?.bedNumber || "ICU"}: ${study.modality} ${study.bodyPart}. Impression: "${reportValues.impression}"`,
        channel: "system",
        category: "LAB_PANIC",
        priority: "critical",
        status: "unread",
        tenantId: "TNT-9014",
        hospitalId: "HOSP-01",
        patientId: study.uhid,
        patientName: study.patientName,
      });
    }

    // 4. Task 5: Platform Audit Logging
    PlatformAuditService.recordAuditEvent({
      actor: reportValues.radiologist,
      actorRole: "RADIOLOGIST",
      action: `RADIOLOGY_REPORT_FINALIZED: #${study.studyId}`,
      category: "COMPLIANCE_EVENT",
      entity: `Patient ${study.patientName} (${study.uhid})`,
      ipAddress: "192.168.1.105",
      riskLevel: isCritical ? "CRITICAL" : "INFO",
      details: JSON.stringify({
        studyId: study.studyId,
        uhid: study.uhid,
        modality: study.modality,
        bodyPart: study.bodyPart,
        radiologist: reportValues.radiologist,
        impression: reportValues.impression,
        timestamp,
      }),
    });

    // 5. Dispatch to doctor review inbox (hms_lab_orders)
    if (typeof window !== "undefined") {
      try {
        const existingLab = JSON.parse(localStorage.getItem("hms_lab_orders") || "[]");
        const existingIndex = existingLab.findIndex(
          (item: { orderNo?: string; id?: string }) => item.orderNo === study.studyId || item.id === study.studyId
        );

        const labRecord = {
          id: `rad-${study.studyId}`,
          orderNo: study.studyId,
          patientName: study.patientName,
          uhid: study.uhid,
          testName: `${study.modality} Scan: ${study.bodyPart}`,
          category: "RADIOLOGY",
          resultValue: reportValues.impression || "Radiology Scan Completed",
          normalRange: reportValues.findings || "See Full Impression",
          orderDate: study.date,
          status: "PENDING_DOCTOR_REVIEW",
          criticalNotice: isCritical ? "Critical Radiology Alert! Urgent doctor review required." : undefined,
        };

        if (existingIndex >= 0) {
          existingLab[existingIndex] = labRecord;
        } else {
          existingLab.unshift(labRecord);
        }

        localStorage.setItem("hms_lab_orders", JSON.stringify(existingLab));
      } catch {
        /* non-blocking */
      }
    }
  }
}
