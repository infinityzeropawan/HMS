"use client";

import React, { useState } from "react";
import { DatePicker, Select, Dropdown, MenuProps, message } from "antd";
import { Filter, RefreshCw, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { HmsButton } from "../HmsButton/HmsButton";
import { DepartmentService } from "@/app/(admin)/_admin_services/department_service";
import { ExportService, ExportColumn } from "@/lib/export_service/export_service";

export interface ReportFilterBarProps {
  reportTitle?: string;
  exportFilename?: string;
  columns?: ExportColumn[];
  data?: Record<string, unknown>[];
  onFilterChange?: (filters: { dateRange: [string, string] | null; departmentId: string }) => void;
  onRefresh?: () => void;
  className?: string;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  reportTitle = "Executive Analytics Report",
  exportFilename = "hospital_report",
  columns = [],
  data = [],
  onFilterChange,
  onRefresh,
  className = "",
}) => {
  const departments = DepartmentService.getDepartments();
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    if (onFilterChange) {
      onFilterChange({ dateRange, departmentId: val });
    }
  };

  const handleDateChange = (_: unknown, dateStrings: [string, string]) => {
    const range = dateStrings[0] && dateStrings[1] ? dateStrings : null;
    setDateRange(range);
    if (onFilterChange) {
      onFilterChange({ dateRange: range, departmentId: selectedDept });
    }
  };

  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
    }
    message.success("Report data refreshed");
  };

  const handleExportCsv = () => {
    if (columns.length === 0 || data.length === 0) {
      message.warning("No data records available to export.");
      return;
    }
    ExportService.exportToCsv(exportFilename, columns, data);
    message.success(`CSV file downloaded: ${exportFilename}.csv`);
  };

  const handleExportExcel = () => {
    if (columns.length === 0 || data.length === 0) {
      message.warning("No data records available to export.");
      return;
    }
    ExportService.exportToExcel(exportFilename, columns, data);
    message.success(`Excel file downloaded: ${exportFilename}.xls`);
  };

  const handleExportPdf = () => {
    if (columns.length === 0 || data.length === 0) {
      message.warning("No data records available to export.");
      return;
    }
    ExportService.exportToPdf(reportTitle, columns, data);
    message.info("PDF Print preview opened.");
  };

  const exportMenuItems: MenuProps["items"] = [
    {
      key: "csv",
      label: "Export to CSV (.csv)",
      icon: <FileText className="w-4 h-4 text-teal-600" />,
      onClick: handleExportCsv,
    },
    {
      key: "excel",
      label: "Export to Excel (.xls)",
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
      onClick: handleExportExcel,
    },
    {
      type: "divider",
    },
    {
      key: "pdf",
      label: "Print / Save as PDF",
      icon: <Printer className="w-4 h-4 text-purple-600" />,
      onClick: handleExportPdf,
    },
  ];

  return (
    <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 ${className}`}>
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filters:</span>
        </div>

        <DatePicker.RangePicker
          onChange={handleDateChange}
          className="w-full sm:w-64"
          size="middle"
        />

        <Select
          value={selectedDept}
          onChange={handleDeptChange}
          className="w-full sm:w-56"
          size="middle"
        >
          <Select.Option value="ALL">All Departments</Select.Option>
          {departments.map((d) => (
            <Select.Option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Right Action Controls */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <HmsButton
          size="sm"
          variant="outline"
          icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
          onClick={handleRefreshClick}
          className="w-full sm:w-auto"
        >
          Refresh
        </HmsButton>

        <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
          <HmsButton
            size="sm"
            variant="emerald"
            icon={<Download className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto"
          >
            Export Report
          </HmsButton>
        </Dropdown>
      </div>
    </div>
  );
};
