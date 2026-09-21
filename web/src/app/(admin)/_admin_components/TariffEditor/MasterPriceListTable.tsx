"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Badge,
  Timeline,
  Alert,
  message,
  Tabs,
} from "antd";
import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  History,
  Package,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Building2,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useTariffStore } from "../../_admin_stores/admin_tariff_store";
import { TariffService } from "../../_admin_services/tariff_service";
import {
  HospitalTariff,
  TariffCategory,
  TariffValidationResult,
  PackageComponentItem,
} from "../../_admin_types/tariff_types";

const CATEGORY_OPTIONS: { label: string; value: TariffCategory | "ALL" }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Consultation", value: "CONSULTATION" },
  { label: "Procedure", value: "PROCEDURE" },
  { label: "Bed Charges", value: "BED_CHARGES" },
  { label: "Nursing Charges", value: "NURSING_CHARGES" },
  { label: "Laboratory", value: "LABORATORY" },
  { label: "Radiology", value: "RADIOLOGY" },
  { label: "Pharmacy", value: "PHARMACY" },
  { label: "Emergency", value: "EMERGENCY" },
  { label: "Operation Theatre", value: "OPERATION_THEATRE" },
  { label: "Package", value: "PACKAGE" },
  { label: "Insurance Package", value: "INSURANCE_PACKAGE" },
];

import { useAuthUserStore } from "@/app/(auth)/_auth_stores/auth_user_store";

export interface MasterPriceListTableProps {
  externalCreateModalOpen?: boolean;
  onResetExternalCreateModal?: () => void;
}

export const MasterPriceListTable: React.FC<MasterPriceListTableProps> = ({
  externalCreateModalOpen,
  onResetExternalCreateModal,
}) => {
  const tariffs = useTariffStore((state) => state.tariffs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TariffCategory | "ALL">("ALL");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<HospitalTariff | null>(null);

  // Forms
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  React.useEffect(() => {
    if (externalCreateModalOpen) {
      addForm.resetFields();
      setIsAddModalOpen(true);
      onResetExternalCreateModal?.();
    }
  }, [externalCreateModalOpen]);

  // Validation report state
  const [validationReport, setValidationReport] = useState<TariffValidationResult | null>(null);

  // Authenticated actor session
  const user = useAuthUserStore((s) => s.user);
  const currentActorRole = user?.role || "HOSPITAL_ADMIN";
  const currentActorName = user?.username || "Dr. Rajesh Sharma (Admin)";

  // Filtered dataset
  const filteredTariffs = tariffs.filter((t) => {
    const matchesCat = selectedCategory === "ALL" || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.serviceCode.toLowerCase().includes(q) ||
      t.billingCode.toLowerCase().includes(q) ||
      t.serviceName.toLowerCase().includes(q) ||
      t.departmentName.toLowerCase().includes(q) ||
      t.hsnSacCode.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleOpenEdit = (tariff: HospitalTariff) => {
    setSelectedTariff(tariff);
    editForm.setFieldsValue({
      baseRate: tariff.baseRate,
      gstRate: tariff.gstRate,
      reason: "",
    });
    setIsEditModalOpen(true);
  };

  const handleSavePriceRevision = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedTariff) return;

      const res = TariffService.updateTariffPrice(
        selectedTariff.id,
        values.baseRate,
        values.gstRate,
        currentActorName,
        currentActorRole,
        values.reason
      );

      if (res.success) {
        message.success(res.message);
        setIsEditModalOpen(false);
        setSelectedTariff(null);
      } else {
        message.error(res.message);
      }
    } catch {
      // Form validation error
    }
  };

  const handleCreateTariff = async () => {
    try {
      const values = await addForm.validateFields();
      const res = TariffService.createTariff(
        {
          serviceCode: values.serviceCode,
          billingCode: values.billingCode,
          serviceName: values.serviceName,
          category: values.category,
          hsnSacCode: values.hsnSacCode || "999312",
          baseRate: values.baseRate,
          gstRate: values.gstRate || 0,
          departmentId: values.departmentId || "dept-101",
          departmentCode: values.departmentCode || "CARD-01",
          departmentName: values.departmentName || "Cardiology & Cardiac Sciences",
          status: "ACTIVE",
          effectiveDate: new Date().toISOString().split("T")[0],
        },
        currentActorName,
        currentActorRole
      );

      if (res.success) {
        message.success(res.message);
        setIsAddModalOpen(false);
        addForm.resetFields();
      } else {
        message.error(res.message);
      }
    } catch {
      // Form validation error
    }
  };

  const handleToggleStatus = (tariff: HospitalTariff) => {
    const res = TariffService.toggleTariffStatus(
      tariff.id,
      currentActorName,
      currentActorRole
    );
    if (res.success) {
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  const handleRunValidation = () => {
    const report = TariffService.validateTariffIntegrity();
    setValidationReport(report);
    if (report.valid && report.warnings.length === 0) {
      message.success("Tariff Master Integrity Check Passed: All canonical codes & GST maps are valid.");
    } else {
      message.warning(`Tariff Audit Complete: ${report.errors.length} errors, ${report.warnings.length} warnings.`);
    }
  };

  const columns = [
    {
      title: "Canonical Identifiers",
      key: "identifiers",
      render: (t: HospitalTariff) => (
        <div>
          <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1">
            <span>{t.serviceCode}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500">{t.billingCode}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">ID: {t.id}</div>
        </div>
      ),
    },
    {
      title: "Service Description",
      key: "serviceName",
      render: (t: HospitalTariff) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">{t.serviceName}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{t.departmentName}</span>
            <span className="text-slate-400">({t.departmentCode})</span>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: TariffCategory) => {
        let color = "blue";
        if (cat === "BED_CHARGES") color = "purple";
        if (cat === "CONSULTATION") color = "cyan";
        if (cat === "EMERGENCY") color = "red";
        if (cat === "PACKAGE" || cat === "INSURANCE_PACKAGE") color = "gold";
        if (cat === "OPERATION_THEATRE") color = "magenta";
        return <Tag color={color} className="font-semibold text-xs">{cat}</Tag>;
      },
    },
    {
      title: "SAC / HSN Code",
      dataIndex: "hsnSacCode",
      key: "hsnSacCode",
      render: (code: string) => <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{code}</span>,
    },
    {
      title: "Base Rate (₹)",
      dataIndex: "baseRate",
      key: "baseRate",
      render: (rate: number) => (
        <span className="font-bold text-slate-900 text-sm">
          ₹{rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "GST Rate (%)",
      dataIndex: "gstRate",
      key: "gstRate",
      render: (gst: number) => (
        <Badge
          count={`${gst}%`}
          style={{
            backgroundColor: gst === 0 ? "#10b981" : gst >= 18 ? "#f59e0b" : "#3b82f6",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (t: HospitalTariff) => (
        <div className="flex items-center gap-2">
          <HmsButton
            size="sm"
            variant="secondary"
            icon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenEdit(t)}
          >
            Edit / History
          </HmsButton>
          {(t.category === "PACKAGE" || t.category === "INSURANCE_PACKAGE") && (
            <HmsButton
              size="sm"
              variant="outline"
              icon={<Package className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => {
                setSelectedTariff(t);
                setIsPackageModalOpen(true);
              }}
            >
              Components ({t.packageItems?.length || 0})
            </HmsButton>
          )}
          <HmsButton
            size="sm"
            variant={t.status === "ACTIVE" ? "danger" : "outline"}
            onClick={() => handleToggleStatus(t)}
          >
            {t.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </HmsButton>
        </div>
      ),
    },
  ];

  const handleExportCsv = () => {
    const csvContent = TariffService.exportTariffsToCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hospital_tariff_master_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Tariff Master exported to CSV successfully!");
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search service name, code, SAC..."
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              className="w-full"
              value={selectedCategory}
              options={CATEGORY_OPTIONS}
              onChange={(val) => setSelectedCategory(val)}
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredTariffs.length}</span> of {tariffs.length} tariffs
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Tag color="purple" className="!px-3 !py-1 text-xs font-semibold">
            Actor Role: {currentActorRole}
          </Tag>

          <HmsButton
            size="sm"
            variant="ghost"
            onClick={handleExportCsv}
          >
            Export CSV
          </HmsButton>

          <HmsButton
            size="sm"
            variant="outline"
            icon={<ShieldCheck className="w-4 h-4 text-teal-600" />}
            onClick={handleRunValidation}
            className="w-full sm:w-auto"
          >
            Audit Integrity
          </HmsButton>

          <HmsButton
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Add Tariff
          </HmsButton>
        </div>
      </div>

      {/* Validation Banner if run */}
      {validationReport && (
        <Alert
          type={validationReport.errors.length > 0 ? "error" : validationReport.warnings.length > 0 ? "warning" : "success"}
          showIcon
          icon={validationReport.errors.length > 0 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          message={
            <div className="font-semibold">
              Tariff Master Validation Report: {validationReport.errors.length} Errors | {validationReport.warnings.length} Warnings
            </div>
          }
          description={
            <div className="text-xs space-y-1 mt-1">
              {validationReport.errors.map((err, i) => (
                <div key={i} className="text-red-700 font-medium">• {err}</div>
              ))}
              {validationReport.warnings.map((warn, i) => (
                <div key={i} className="text-amber-700">• {warn}</div>
              ))}
              {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
                <div className="text-emerald-700 font-medium">All tariff canonical identifiers, GST codes, department links, and bed rate mappings are 100% verified.</div>
              )}
            </div>
          }
          closable
          onClose={() => setValidationReport(null)}
        />
      )}

      {/* Main Tariff Table */}
      <div className="w-full overflow-x-auto">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredTariffs}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered
          size="middle"
        />
      </div>

      {/* Price Revision & History Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Edit3 className="w-5 h-5 text-teal-600" />
            <span>Price Revision & History: {selectedTariff?.serviceCode}</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedTariff(null);
        }}
        onOk={handleSavePriceRevision}
        okText="Commit Price Revision"
        width={720}
      >
        {selectedTariff && (
          <Tabs
            defaultActiveKey="edit"
            items={[
              {
                key: "edit",
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Edit3 className="w-4 h-4" /> Revise Rate & GST
                  </span>
                ),
                children: (
                  <Form form={editForm} layout="vertical" className="mt-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 space-y-1">
                      <div className="text-xs text-slate-500">Service: <span className="font-semibold text-slate-900">{selectedTariff.serviceName}</span></div>
                      <div className="text-xs text-slate-500">Canonical Billing Code: <span className="font-mono text-slate-800">{selectedTariff.billingCode}</span></div>
                      <div className="text-xs text-slate-500">Department: <span className="font-medium text-slate-800">{selectedTariff.departmentName} ({selectedTariff.departmentCode})</span></div>
                      <div className="text-xs text-slate-500">Current Base Rate: <span className="font-bold text-teal-700">₹{selectedTariff.baseRate}</span> | GST: <span className="font-bold text-amber-700">{selectedTariff.gstRate}%</span></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        name="baseRate"
                        label="New Base Rate (₹)"
                        rules={[{ required: true, message: "Please specify new base rate" }]}
                      >
                        <InputNumber min={0} className="w-full" prefix="₹" precision={2} />
                      </Form.Item>

                      <Form.Item
                        name="gstRate"
                        label="New GST Tax Percentage (%)"
                        rules={[{ required: true, message: "Please select GST rate" }]}
                      >
                        <Select
                          options={[
                            { label: "0% (Exempt Healthcare Service)", value: 0 },
                            { label: "5% GST", value: 5 },
                            { label: "12% GST (Diagnostic & Medical Equipment)", value: 12 },
                            { label: "18% GST (Pathology & Consumables)", value: 18 },
                            { label: "28% GST", value: 28 },
                          ]}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="reason"
                      label="Mandatory Reason / Justification for Price Modification"
                      rules={[{ required: true, message: "Reason is required to satisfy hospital audit trail requirements." }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="e.g. Annual tariff revision approved by finance committee / GST slab realignment..."
                      />
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: "history",
                label: (
                  <span className="flex items-center gap-1.5 font-medium">
                    <History className="w-4 h-4 text-purple-600" /> Audit Price History ({selectedTariff.history.length})
                  </span>
                ),
                children: (
                  <div className="mt-3 max-h-96 overflow-y-auto pr-2">
                    {selectedTariff.history.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No previous price modifications recorded for this tariff item.
                      </div>
                    ) : (
                      <Timeline
                        items={selectedTariff.history.map((h) => ({
                          color: "green",
                          children: (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center justify-between font-semibold text-slate-800">
                                <span>₹{h.oldPrice} → ₹{h.newPrice} (GST: {h.oldGstRate}% → {h.newGstRate}%)</span>
                                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(h.modifiedDate).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-slate-600">
                                Modified By: <span className="font-medium text-slate-900">{h.modifiedBy}</span> ({h.modifiedRole})
                              </div>
                              {h.reason && (
                                <div className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                                  "{h.reason}"
                                </div>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>

      {/* Add New Tariff Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Plus className="w-5 h-5 text-teal-600" />
            <span>Register New Hospital Tariff</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        onOk={handleCreateTariff}
        okText="Register Tariff"
        width={680}
      >
        <Form form={addForm} layout="vertical" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="serviceCode"
              label="Service Code (e.g. SRV-CARD-05)"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="SRV-DIAG-01" />
            </Form.Item>

            <Form.Item
              name="billingCode"
              label="Billing Code (e.g. BILL-CARD-05)"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="BILL-DIAG-01" />
            </Form.Item>
          </div>

          <Form.Item
            name="serviceName"
            label="Service Name Description"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. 2D Echocardiogram with Doppler" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="category"
              label="Tariff Category"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                options={CATEGORY_OPTIONS.filter((c) => c.value !== "ALL")}
                placeholder="Select category"
              />
            </Form.Item>

            <Form.Item
              name="hsnSacCode"
              label="HSN / SAC Code"
              rules={[{ required: true, message: "Required" }]}
              initialValue="999312"
            >
              <Input placeholder="999312" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              name="baseRate"
              label="Base Rate (₹)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={0} className="w-full" prefix="₹" />
            </Form.Item>

            <Form.Item
              name="gstRate"
              label="GST Percentage (%)"
              initialValue={0}
            >
              <Select
                options={[
                  { label: "0% (Healthcare Service)", value: 0 },
                  { label: "5%", value: 5 },
                  { label: "12%", value: 12 },
                  { label: "18%", value: 18 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item
              name="departmentId"
              label="Department ID"
              initialValue="dept-101"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="departmentCode"
              label="Dept Code"
              initialValue="CARD-01"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="departmentName"
              label="Dept Name"
              initialValue="Cardiology & Cardiac Sciences"
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Package Components Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <Package className="w-5 h-5 text-amber-600" />
            <span>Package Components: {selectedTariff?.serviceName}</span>
          </div>
        }
        open={isPackageModalOpen}
        onCancel={() => {
          setIsPackageModalOpen(false);
          setSelectedTariff(null);
        }}
        footer={null}
        width={640}
      >
        {selectedTariff && (
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs space-y-1">
              <div>Package Code: <span className="font-mono font-bold text-slate-800">{selectedTariff.serviceCode}</span></div>
              <div>Bundled Base Rate: <span className="font-bold text-slate-900">₹{selectedTariff.baseRate}</span></div>
            </div>

            <Table
              rowKey="serviceCode"
              pagination={false}
              size="small"
              columns={[
                { title: "Service Code", dataIndex: "serviceCode", key: "serviceCode", render: (c: string) => <span className="font-mono text-xs font-semibold">{c}</span> },
                { title: "Service Component Name", dataIndex: "serviceName", key: "serviceName" },
                { title: "Standard Rate", dataIndex: "baseRate", key: "baseRate", render: (r: number) => `₹${r}` },
                { title: "Qty", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Subtotal",
                  key: "subtotal",
                  render: (item: PackageComponentItem) => `₹${item.baseRate * item.quantity}`,
                },
              ]}
              dataSource={selectedTariff.packageItems || []}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
