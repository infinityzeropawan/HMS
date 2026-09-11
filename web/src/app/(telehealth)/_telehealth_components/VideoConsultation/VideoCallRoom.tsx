"use client";

import React, { useState } from "react";
import { Form, Input, Tag, message } from "antd";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { HmsAiGeneratedBadge } from "@/common_components/HmsAiBadge/HmsAiGeneratedBadge";
import { RemoteTelemetryPanel } from "../RemoteVitals/RemoteTelemetryPanel";

export const VideoCallRoom: React.FC<{ sessionNo: string }> = ({ sessionNo }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
      {/* Left 2 Columns: Video Feed & WebRTC Call Controls */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 flex flex-col justify-between relative shadow-lg">
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Tag color="emerald" icon={<Video className="w-3.5 h-3.5 inline mr-1" />}>
              LIVE TELE-CONSULTATION
            </Tag>
            <span className="text-xs text-slate-300 font-mono">Session: {sessionNo}</span>
          </div>
          <HmsAiGeneratedBadge label="AI Speech Note-taker" />
        </div>

        {/* Video Call Simulation Screen */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-lg bg-slate-800 border border-slate-700 my-4">
          <div className="text-center text-slate-400">
            <div className="w-20 h-20 rounded-full bg-teal-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
              SV
            </div>
            <h3 className="text-lg font-bold text-white">Sunil Verma</h3>
            <p className="text-xs text-slate-400">Connected via WebRTC Encrypted Channel</p>
          </div>

          {/* Self Video PIP */}
          <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center text-xs text-slate-300">
            Dr. Rajesh Sharma
          </div>
        </div>

        {/* Call Action Bar */}
        <div className="flex justify-center items-center gap-4 z-10">
          <HmsButton
            variant="secondary"
            onClick={() => setMicOn(!micOn)}
            icon={micOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-500" />}
          >
            {micOn ? "Mute" : "Unmute"}
          </HmsButton>

          <HmsButton
            variant="secondary"
            onClick={() => setVideoOn(!videoOn)}
            icon={videoOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-500" />}
          >
            {videoOn ? "Cam On" : "Cam Off"}
          </HmsButton>

          <HmsButton
            variant="danger"
            onClick={() => message.info("Tele-consultation call session ended.")}
            icon={<PhoneOff className="w-4 h-4" />}
          >
            End Call
          </HmsButton>
        </div>
      </div>

      {/* Right Column: Remote Telemetry & Live Telehealth Notes */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-y-auto">
        <RemoteTelemetryPanel />

        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Telehealth Clinical Notes</h4>
          <Form layout="vertical">
            <Form.Item label="Tele-Consultation Summary">
              <Input.TextArea rows={4} placeholder="Type notes during video call..." />
            </Form.Item>
            <HmsButton block type="primary" variant="emerald">
              Save Telehealth Record
            </HmsButton>
          </Form>
        </div>
      </div>
    </div>
  );
};
