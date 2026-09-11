"use client";

import React from "react";
import { useParams } from "next/navigation";
import { VideoCallRoom } from "../../_telehealth_components/VideoConsultation/VideoCallRoom";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TelehealthConsultPage() {
  const params = useParams();
  const sessionNo = Array.isArray(params?.sessionNo) ? params.sessionNo[0] : params?.sessionNo || "TELE-8801";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/queue">
          <HmsButton icon={<ArrowLeft className="w-4 h-4" />} variant="secondary" size="sm">
            Doctor Queue
          </HmsButton>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Encrypted Telehealth Video Consultation</h1>
        </div>
      </div>

      <VideoCallRoom sessionNo={sessionNo} />
    </div>
  );
}
