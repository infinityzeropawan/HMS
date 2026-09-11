"use client";

import React, { useState } from "react";
import { Tag } from "antd";
import { ZoomIn, ZoomOut, Contrast, Eye, Layers } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";

export const DicomStudyViewerPanel: React.FC<{ studyId: string }> = ({ studyId }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [inverted, setInverted] = useState(false);

  return (
    <div className="bg-slate-900 rounded-xl p-4 flex flex-col h-[calc(100vh-140px)] border border-slate-800 text-white">
      {/* DICOM Header Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Tag color="purple" icon={<Layers className="w-3.5 h-3.5 inline mr-1" />}>
            PACS DICOM WEB VIEWER
          </Tag>
          <span className="text-xs text-slate-300 font-mono">Study ID: {studyId}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">&bull; Patient: Sunil Verma (P-2026-1049) &bull; Modality: Chest X-Ray PA</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <HmsButton size="sm" variant="secondary" onClick={() => setZoomLevel((z) => Math.min(z + 20, 200))} icon={<ZoomIn className="w-3.5 h-3.5" />}>
            Zoom In ({zoomLevel}%)
          </HmsButton>
          <HmsButton size="sm" variant="secondary" onClick={() => setZoomLevel((z) => Math.max(z - 20, 60))} icon={<ZoomOut className="w-3.5 h-3.5" />}>
            Zoom Out
          </HmsButton>
          <HmsButton size="sm" variant="secondary" onClick={() => setInverted(!inverted)} icon={<Contrast className="w-3.5 h-3.5" />}>
            Invert ({inverted ? "On" : "Off"})
          </HmsButton>
        </div>
      </div>

      {/* DICOM Screen Simulation Area */}
      <div className="flex-1 my-4 bg-black rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <div
          className={`transition-all duration-200 text-center ${inverted ? "invert bg-white text-black p-8 rounded-xl" : "text-teal-400"}`}
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <Eye className="w-24 h-24 mx-auto mb-2 text-teal-500 opacity-80" />
          <h3 className="text-lg font-bold">DICOM 2D/3D Radiology View</h3>
          <p className="text-xs text-slate-400 font-mono">Series #1 &bull; 1024 x 1024 Matrix &bull; 16-Bit Grayscale</p>
        </div>

        {/* DICOM Metadata Overlay */}
        <div className="absolute top-3 left-3 text-[10px] text-slate-400 font-mono bg-black/60 p-2 rounded border border-slate-800">
          <div>Patient: Sunil Verma (45M)</div>
          <div>Modality: CR / Chest PA</div>
          <div>KvP: 120 | mAs: 4.5</div>
        </div>

        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono bg-black/60 p-2 rounded border border-slate-800">
          <div>W: 400 L: 40</div>
          <div>Zoom: {zoomLevel}%</div>
        </div>
      </div>
    </div>
  );
};
