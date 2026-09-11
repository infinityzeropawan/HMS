"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EncounterWorkspaceLayout } from "../../_doctor_components/EncounterWorkspace/EncounterWorkspaceLayout";

export default function DoctorEncounterPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "P-2026-1049";

  return <EncounterWorkspaceLayout patientUhid={id} />;
}
