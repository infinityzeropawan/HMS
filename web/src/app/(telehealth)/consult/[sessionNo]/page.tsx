"use client";

import React from "react";
import { useParams } from "next/navigation";
import { VideoCallRoom } from "../../_telehealth_components/VideoConsultation/VideoCallRoom";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";

export default function TelehealthConsultPage() {
  const params = useParams();
  const sessionNo = Array.isArray(params?.sessionNo) ? params.sessionNo[0] : params?.sessionNo || "TELE-8801";

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen safe-area-padding safe-area-bottom">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <HmsButton href="/doctor/queue" icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
          Doctor Queue
        </HmsButton>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Encrypted Telehealth Video Consultation</h1>
        </div>
      </div>

      <VideoCallRoom sessionNo={sessionNo} />
    </div>
  );
}
