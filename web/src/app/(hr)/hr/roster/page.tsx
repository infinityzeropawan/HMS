"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function HrRosterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/roster");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
      <Spin size="large" />
      <p className="text-sm font-medium text-slate-500">Redirecting to Duty Roster Master...</p>
    </div>
  );
}
