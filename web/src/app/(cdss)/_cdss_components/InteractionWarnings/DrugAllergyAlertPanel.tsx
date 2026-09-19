"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Alert } from "antd";
import { ShieldAlert } from "lucide-react";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { PatientProfileService } from "@/app/(patient)/_patient_services/patient_profile_service";
import { EmrService } from "@/app/(patient)/_patient_services/emr_service";
import { CdssService } from "../../_cdss_services/cdss_service";
import { ClinicalAlert } from "../../_cdss_types/cdss_types";
import { usePatientStore } from "@/app/(patient)/_patient_stores/patient_store";

export const DrugAllergyAlertPanel: React.FC = () => {
  const [liveAlerts, setLiveAlerts] = useState<ClinicalAlert[]>([]);

  useEffect(() => {
    // 1. Get all registered patients from usePatientStore
    const allPatients = usePatientStore.getState().searchPatients("");
    const aggregatedAlerts: ClinicalAlert[] = [];

    allPatients.forEach((patient) => {
      const patient360 = PatientProfileService.getPatient360(patient.uhid);
      const emrProfile = EmrService.getPatientEmrProfile(patient.uhid);

      const generated = CdssService.generateClinicalAlerts(
        patient360,
        emrProfile.encounters[0],
        emrProfile.labResults,
        emrProfile.radiologyStudies
      );

      generated.forEach((alt) => {
        aggregatedAlerts.push({
          ...alt,
          patientName: `${patient.fullName} (${patient.uhid})`,
        });
      });
    });

    setLiveAlerts(aggregatedAlerts);
  }, []);

  const columns = [
    { title: "Patient UHID", dataIndex: "patientName", key: "patientName" },
    {
      title: "Alert Category",
      dataIndex: "category",
      key: "category",
      render: (t: string) => <Tag color="purple">{t}</Tag>,
    },
    {
      title: "Severity Level",
      dataIndex: "severity",
      key: "severity",
      render: (s: string) => <Tag color={s === "CRITICAL" ? "red" : s === "HIGH" ? "orange" : "blue"}>{s}</Tag>,
    },
    { title: "Clinical Warning Detail", dataIndex: "detail", key: "detail" },
    { title: "CDSS Rule Action", dataIndex: "recommendedAction", key: "recommendedAction" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Alert
          message="Real-Time CDSS Clinical Warning Engine Active"
          description="Monitors drug-drug, drug-allergy, and drug-lab contraindications automatically from HMS patient records."
          type="warning"
          showIcon
          icon={<ShieldAlert className="w-4 h-4 text-amber-600" />}
          className="flex-1 mr-4 text-xs"
        />
        <HmsAiGeneratedBadge label="CDSS Rules Engine" />
      </div>

      <Table
        columns={columns}
        dataSource={liveAlerts.map((a) => ({ ...a, key: a.id }))}
        pagination={false}
        locale={{ emptyText: "No active drug-drug or drug-allergy contraindication alerts." }}
      />
    </div>
  );
};
