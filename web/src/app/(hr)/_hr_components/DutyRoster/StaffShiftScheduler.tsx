"use client";

import React from "react";
import { Table, Tag, Tooltip, Select, message } from "antd";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useRosterStore } from "@/app/(admin)/_admin_stores/admin_roster_store";
import { RosterService } from "@/app/(admin)/_admin_services/roster_service";
import { StaffShiftRoster } from "@/app/(admin)/_admin_types/roster_types";

export const StaffShiftScheduler: React.FC = () => {
  const rosters = useRosterStore((state) => state.rosters);

  const handleStatusChange = (shiftId: string, status: StaffShiftRoster["status"]) => {
    try {
      RosterService.modifyShift(shiftId, { status }, "HR Duty Roster Workspace");
      message.success(`Updated shift status to ${status}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      message.error(msg);
    }
  };

  const columns = [
    {
      title: "Staff Member & ID",
      key: "staff",
      render: (_: unknown, record: StaffShiftRoster) => (
        <div>
          <span className="font-mono text-3xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {record.staffId}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">{record.staffName}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <Tag color="purple" className="text-3xs font-bold">{record.role}</Tag>
            <span className="text-3xs text-slate-400 font-mono">{record.departmentCode}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (d: string) => <span className="font-semibold text-xs text-slate-800">{d}</span>,
    },
    {
      title: "Shift Type & Hours",
      key: "shift",
      render: (_: unknown, record: StaffShiftRoster) => {
        let color = "blue";
        if (record.shift === "EVENING") color = "gold";
        if (record.shift === "NIGHT") color = "purple";
        if (record.shift === "ON_CALL") color = "red";
        if (record.shift === "CUSTOM") color = "cyan";

        return (
          <div>
            <Tag color={color} className="font-bold text-xs">{record.shift}</Tag>
            <div className="text-3xs text-slate-500 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {record.shiftHours}
            </div>
          </div>
        );
      },
    },
    {
      title: "Assigned Station",
      dataIndex: "assignedWardOrRoom",
      key: "assignedWardOrRoom",
      render: (loc: string) => (
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-teal-600" /> {loc}
        </span>
      ),
    },
    {
      title: "Duty Date",
      dataIndex: "dutyDate",
      key: "dutyDate",
      render: (date: string) => (
        <span className="font-mono text-xs text-slate-700 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {date}
        </span>
      ),
    },
    {
      title: "Duty Status",
      dataIndex: "status",
      key: "status",
      render: (s: StaffShiftRoster["status"], record: StaffShiftRoster) => (
        <Select
          value={s}
          onChange={(val) => handleStatusChange(record.id, val)}
          className="w-36"
          size="small"
        >
          <Select.Option value="ON_DUTY">ON DUTY</Select.Option>
          <Select.Option value="OFF_DUTY">OFF DUTY</Select.Option>
          <Select.Option value="ON_LEAVE">ON LEAVE</Select.Option>
          <Select.Option value="EMERGENCY_CALL">EMERGENCY CALL</Select.Option>
        </Select>
      ),
    },
  ];

  return <Table columns={columns} dataSource={rosters} rowKey="id" pagination={{ pageSize: 8 }} />;
};
