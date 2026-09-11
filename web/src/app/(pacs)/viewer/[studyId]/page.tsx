"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DicomStudyViewerPanel } from "../../_pacs_components/DicomViewer/DicomStudyViewerPanel";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";

export default function PacsViewerPage() {
  const params = useParams();
  const studyId = Array.isArray(params?.studyId) ? params.studyId[0] : params?.studyId || "STD-9901";

  return (
    <div className="p-4 sm:p-6 bg-slate-950 min-h-screen safe-area-padding safe-area-bottom">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <HmsButton href="/queue" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
          Doctor Queue
        </HmsButton>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white">RIS / PACS Diagnostic Web Viewer</h1>
        </div>
      </div>

      <DicomStudyViewerPanel studyId={studyId} />
    </div>
  );
}
