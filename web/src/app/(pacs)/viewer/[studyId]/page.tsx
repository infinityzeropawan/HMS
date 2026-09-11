"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DicomStudyViewerPanel } from "../../_pacs_components/DicomViewer/DicomStudyViewerPanel";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PacsViewerPage() {
  const params = useParams();
  const studyId = Array.isArray(params?.studyId) ? params.studyId[0] : params?.studyId || "STD-9901";

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/queue">
          <HmsButton icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
            Doctor Queue
          </HmsButton>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">RIS / PACS Diagnostic Web Viewer</h1>
        </div>
      </div>

      <DicomStudyViewerPanel studyId={studyId} />
    </div>
  );
}
