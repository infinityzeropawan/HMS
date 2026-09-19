"use client";

import React from "react";
import { Form, Input, InputNumber, Switch, Select, Tabs, Checkbox, message, Tooltip, Tag } from "antd";
import {
  Building2,
  Stethoscope,
  Receipt,
  Globe,
  Save,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Lock,
  Clock,
  Award,
  Bell,
  Hash,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { HmsButton } from "@/common_components/HmsButton/HmsButton";
import { useAdminSettingsStore } from "../../_admin_stores/admin_settings_store";
import { PlatformAuditService } from "@/app/(super-admin)/_super_admin_services/platform_audit_service";

export const HospitalSettingsWorkspace: React.FC = () => {
  const settings = useAdminSettingsStore();
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const currentState = useAdminSettingsStore.getState();
    const changedFields: string[] = [];
    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    Object.keys(values).forEach((key) => {
      const prevVal = currentState[key as keyof typeof currentState];
      const newVal = values[key];
      if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
        changedFields.push(key);
        previousValues[key] = prevVal;
        newValues[key] = newVal;
      }
    });

    // Update Zustand Store
    settings.updateSettings(values);

    // Audit Integration: Record Audit Event if changes were made
    if (changedFields.length > 0) {
      const auditPayload = {
        event: "Hospital Settings Updated",
        timestamp: new Date().toISOString(),
        actor: "Dr. Rajesh Sharma (Hospital Admin)",
        actorRole: "HOSPITAL_ADMIN",
        changedFields,
        previousValues,
        newValues,
      };

      PlatformAuditService.recordAuditEvent({
        actor: "Dr. Rajesh Sharma (Hospital Admin)",
        actorRole: "HOSPITAL_ADMIN",
        action: "Hospital Settings Updated",
        category: "GOVERNANCE_EVENT",
        entity: `${(values.hospitalName as string) || currentState.hospitalName} (Master Settings)`,
        ipAddress: "192.168.1.105",
        riskLevel: "INFO",
        details: JSON.stringify(auditPayload),
      });

      message.success(`Hospital settings updated & audit event logged (${changedFields.length} field${changedFields.length > 1 ? "s" : ""} modified).`);
    } else {
      message.info("No settings were changed.");
    }
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onFinish={handleFinish}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" /> Hospital Administration & Governance Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure operational parameters, hospital identity, compliance credentials, clinical safety policies, notifications, and document numbering.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Tooltip title="Reset all settings to default hospital profile">
              <HmsButton
                size="sm"
                variant="ghost"
                fullWidth
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="min-h-[44px] sm:min-h-0 sm:w-auto"
                onClick={() => {
                  settings.resetToDefaults();
                  form.setFieldsValue(useAdminSettingsStore.getState());
                  message.info("Settings reset to default profile.");
                }}
              >
                Reset
              </HmsButton>
            </Tooltip>
            <HmsButton variant="emerald" fullWidth icon={<Save className="w-4 h-4" />} htmlType="submit" className="min-h-[44px] sm:min-h-0 sm:w-auto">
              Save Master Settings
            </HmsButton>
          </div>
        </div>

        <Tabs
          defaultActiveKey="identity"
          items={[
            {
              key: "identity",
              label: (
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" /> Identity & Profile
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 2: Hospital Identity */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> Hospital Identity & Classification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="Hospital Type" name="hospitalType" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Super-Specialty">Super-Specialty Hospital</Select.Option>
                          <Select.Option value="Multi-Specialty">Multi-Specialty Hospital</Select.Option>
                          <Select.Option value="Single-Specialty">Single-Specialty Center</Select.Option>
                          <Select.Option value="General Hospital">General Hospital</Select.Option>
                          <Select.Option value="Clinic Chain">Clinic Chain</Select.Option>
                          <Select.Option value="Teaching Hospital">Teaching / Academic Hospital</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Ownership Type" name="ownershipType" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Private Corporate">Private Corporate</Select.Option>
                          <Select.Option value="Trust / Charitable">Trust / Charitable Organization</Select.Option>
                          <Select.Option value="Government">Government / Public Sector</Select.Option>
                          <Select.Option value="Public-Private Partnership">Public-Private Partnership (PPP)</Select.Option>
                          <Select.Option value="Proprietary">Proprietary / Doctor Owned</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-200/60">
                      <Form.Item label="24x7 Emergency Facility" name="emergencyFacility" valuePropName="checked">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                      </Form.Item>

                      <Form.Item label="Designated Trauma Center" name="traumaCenter" valuePropName="checked">
                        <Switch checkedChildren="Level-1 Trauma" unCheckedChildren="No Trauma Care" />
                      </Form.Item>

                      <Form.Item label="Teaching / Medical College Hospital" name="teachingHospital" valuePropName="checked">
                        <Switch checkedChildren="Academic Unit" unCheckedChildren="Non-Academic" />
                      </Form.Item>
                    </div>
                  </div>

                  {/* General Profile */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-600" /> Facility Profile Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="Hospital / Institution Name" name="hospitalName" rules={[{ required: true }]}>
                        <Input prefix={<Building2 className="w-4 h-4 text-slate-400" />} size="large" />
                      </Form.Item>

                      <Form.Item label="Hospital Tagline / Mission Statement" name="tagline">
                        <Input size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="State Medical Registration #" name="registrationNumber" rules={[{ required: true }]}>
                        <Input prefix={<ShieldCheck className="w-4 h-4 text-slate-400" />} size="large" />
                      </Form.Item>

                      <Form.Item label="Hospital GSTIN Number" name="gstin" rules={[{ required: true }]}>
                        <Input prefix={<Receipt className="w-4 h-4 text-slate-400" />} size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Form.Item label="Official Phone Helpline" name="phone">
                        <Input prefix={<Phone className="w-4 h-4 text-slate-400" />} />
                      </Form.Item>

                      <Form.Item label="Official Admin Email" name="email">
                        <Input prefix={<Mail className="w-4 h-4 text-slate-400" />} />
                      </Form.Item>

                      <Form.Item label="Official Portal Website" name="website">
                        <Input prefix={<Globe className="w-4 h-4 text-slate-400" />} />
                      </Form.Item>
                    </div>

                    <Form.Item label="Street Address" name="address">
                      <Input prefix={<MapPin className="w-4 h-4 text-slate-400" />} />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item label="City" name="city">
                        <Input />
                      </Form.Item>
                      <Form.Item label="State" name="state">
                        <Input />
                      </Form.Item>
                      <Form.Item label="PIN Code" name="pincode">
                        <Input />
                      </Form.Item>
                    </div>

                    <Form.Item label="Logo Image URL (For Invoices & Prescriptions)" name="logoUrl">
                      <Input placeholder="https://..." />
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "operational",
              label: (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Operational Settings
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 1: Operational Settings */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" /> Regional & Financial Operation Parameters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Form.Item label="Active Financial Year" name="financialYear" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="2026-2027">FY 2026-2027 (Current)</Select.Option>
                          <Select.Option value="2025-2026">FY 2025-2026</Select.Option>
                          <Select.Option value="2027-2028">FY 2027-2028 (Upcoming)</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Hospital System Timezone" name="timezone" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</Select.Option>
                          <Select.Option value="UTC">UTC (Coordinated Universal Time)</Select.Option>
                          <Select.Option value="America/New_York (EST)">America/New_York (EST -05:00)</Select.Option>
                          <Select.Option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</Select.Option>
                          <Select.Option value="Europe/London (GMT +00:00)">Europe/London (GMT +00:00)</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="System Date Display Format" name="dateFormat" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/09/2026)</Select.Option>
                          <Select.Option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</Select.Option>
                          <Select.Option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</Select.Option>
                          <Select.Option value="DD MMM YYYY">DD MMM YYYY (e.g. 19 Sep 2026)</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item label="Billing Currency Code" name="currencyCode" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="INR">INR - Indian Rupee (₹)</Select.Option>
                          <Select.Option value="USD">USD - US Dollar ($)</Select.Option>
                          <Select.Option value="EUR">EUR - Euro (€)</Select.Option>
                          <Select.Option value="GBP">GBP - British Pound (£)</Select.Option>
                          <Select.Option value="AED">AED - UAE Dirham (AED)</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Calendar Week Start Day" name="weekStartDay" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Monday">Monday</Select.Option>
                          <Select.Option value="Sunday">Sunday</Select.Option>
                          <Select.Option value="Saturday">Saturday</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item label="Hospital Working Days" name="workingDays" rules={[{ required: true }]}>
                      <Checkbox.Group
                        options={[
                          { label: "Monday", value: "Monday" },
                          { label: "Tuesday", value: "Tuesday" },
                          { label: "Wednesday", value: "Wednesday" },
                          { label: "Thursday", value: "Thursday" },
                          { label: "Friday", value: "Friday" },
                          { label: "Saturday", value: "Saturday" },
                          { label: "Sunday (Emergency Only)", value: "Sunday" },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "accreditation",
              label: (
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" /> Accreditation & ABDM
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 3: Accreditation & Compliance */}
                  <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200/60 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" /> NABH, NABL & ABDM Healthcare Accreditations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="NABH Accreditation Number" name="nabhAccreditationNumber">
                        <Input prefix={<Award className="w-4 h-4 text-purple-600" />} placeholder="NABH-HOSP-2024-8891" size="large" />
                      </Form.Item>

                      <Form.Item label="NABH Accreditation Validity Date" name="nabhValidity">
                        <Input prefix={<Calendar className="w-4 h-4 text-slate-400" />} placeholder="YYYY-MM-DD" size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="NABL Laboratory Accreditation Number" name="nablAccreditationNumber">
                        <Input prefix={<Award className="w-4 h-4 text-indigo-600" />} placeholder="NABL-LAB-2024-6622" size="large" />
                      </Form.Item>

                      <Form.Item label="NABL Accreditation Validity Date" name="nablValidity">
                        <Input prefix={<Calendar className="w-4 h-4 text-slate-400" />} placeholder="YYYY-MM-DD" size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="ABDM Health Facility Registry (HFR) ID" name="abdmHfrId">
                        <Input prefix={<ShieldCheck className="w-4 h-4 text-purple-600" />} placeholder="IN2710002819" size="large" />
                      </Form.Item>

                      <Form.Item label="Healthcare Professional Registry (HPR) Mapping Status" name="hprMappingStatus">
                        <Select size="large">
                          <Select.Option value="MAPPED">MAPPED - All Clinicians Synced to HPR</Select.Option>
                          <Select.Option value="PENDING">PENDING - Verification in Progress</Select.Option>
                          <Select.Option value="UNMAPPED">UNMAPPED - Manual Mapping Required</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>

                  {/* Existing Gateway Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-600" /> Gateway Credentials & PACS Connection
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="ABDM ABHA Facility ID (HIP / HPR)" name="abhaFacilityId">
                        <Input prefix={<ShieldCheck className="w-4 h-4 text-purple-600" />} size="large" />
                      </Form.Item>

                      <Form.Item label="ABHA Gateway Client Secret" name="abhaClientSecret">
                        <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} size="large" />
                      </Form.Item>
                    </div>

                    <Form.Item label="Radiology PACS DICOM Server Connection Endpoint" name="pacsDicomServerUrl">
                      <Input placeholder="dicom://pacs.apollo.hms.com:104" />
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "clinical",
              label: (
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" /> Clinical Policies
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 4: Clinical Policy Settings */}
                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/60 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" /> Patient Safety & Clinical Risk Enforcement
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Form.Item label="Allergy Warning Hard-Lock Enforcement" name="allergyWarningEnforcement" valuePropName="checked">
                        <Switch checkedChildren="Hard Stop" unCheckedChildren="Warning Only" />
                      </Form.Item>

                      <Form.Item label="Duplicate Medication Warning Alert" name="duplicateMedicationWarning" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
                      </Form.Item>

                      <Form.Item label="High-Risk Drug (HAM) Double-Check Alerts" name="highRiskDrugAlerts" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label="Controlled Substance & Narcotic Dispensing Policy" name="controlledDrugPolicy" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Strict Double-Check Signoff">Strict Double-Check Signoff (Dual Nurse Approval)</Select.Option>
                          <Select.Option value="Single Sign-off">Single Clinician Sign-off with Biometric</Select.Option>
                          <Select.Option value="Standard Audit Log Only">Standard Pharmacist Dispense Audit Log</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Critical Panic Diagnostic Lab Result Alert Policy" name="criticalLabAlertPolicy" rules={[{ required: true }]}>
                        <Select size="large">
                          <Select.Option value="Immediate Telephonic & SMS Alert">Immediate Telephonic & SMS Alert to Attending Doctor</Select.Option>
                          <Select.Option value="In-App Push Only">In-App High-Priority Push Notification</Select.Option>
                          <Select.Option value="Standard Queue Notification">Standard EMR Queue Flag</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>

                  {/* OPD & Vitals Alert Limits */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-slate-600" /> Consultation & Vital Sign Thresholds
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item label="OPD Consultation Slot Duration (Minutes)" name="opdSlotDurationMinutes">
                        <Select size="large">
                          <Select.Option value={10}>10 Minutes / Express</Select.Option>
                          <Select.Option value={15}>15 Minutes / Standard</Select.Option>
                          <Select.Option value={20}>20 Minutes / Detailed</Select.Option>
                          <Select.Option value={30}>30 Minutes / Specialist</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Prescription Validity (Days)" name="prescriptionExpiryDays">
                        <InputNumber min={7} max={180} className="w-full" size="large" />
                      </Form.Item>

                      <Form.Item label="Auto-Discharge Grace Period (Hours)" name="autoDischargeGraceHours">
                        <InputNumber min={1} max={24} className="w-full" size="large" />
                      </Form.Item>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-blue-600" /> Vital Sign Safety Alert Limits
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <Form.Item label="BP Systolic Alert Limit (mmHg)" name="vitalsBpSystolicUpperLimit">
                          <InputNumber min={100} max={220} className="w-full" />
                        </Form.Item>

                        <Form.Item label="BP Diastolic Alert Limit (mmHg)" name="vitalsBpDiastolicUpperLimit">
                          <InputNumber min={60} max={140} className="w-full" />
                        </Form.Item>

                        <Form.Item label="SpO2 Warning Limit (%)" name="vitalsSpO2LowerLimit">
                          <InputNumber min={70} max={99} className="w-full" />
                        </Form.Item>
                      </div>
                    </div>

                    <Form.Item
                      label="Enable AI Clinical Decision Support (CDSS) Drug-Interaction Warnings"
                      name="enableCdssAlerts"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "notifications",
              label: (
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" /> Notification Policies
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 5: Notification Policies */}
                  <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/60 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" /> Automated Patient & Clinical Dispatch Channels
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Appointment Confirmation SMS</span>
                          <span className="text-[11px] text-slate-500">Send instant SMS booking alerts</span>
                        </div>
                        <Form.Item name="appointmentSms" valuePropName="checked" className="!mb-0">
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Appointment WhatsApp Dispatch</span>
                          <span className="text-[11px] text-slate-500">Send WhatsApp tickets & reminders</span>
                        </div>
                        <Form.Item name="appointmentWhatsApp" valuePropName="checked" className="!mb-0">
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Lab Result Diagnostic Notification</span>
                          <span className="text-[11px] text-slate-500">Alert patient when report is ready</span>
                        </div>
                        <Form.Item name="labResultNotification" valuePropName="checked" className="!mb-0">
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Discharge Summary Alert</span>
                          <span className="text-[11px] text-slate-500">Send PDF summary link to patient</span>
                        </div>
                        <Form.Item name="dischargeNotification" valuePropName="checked" className="!mb-0">
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Billing Invoice Email & SMS</span>
                          <span className="text-[11px] text-slate-500">Send digital receipt link upon settlement</span>
                        </div>
                        <Form.Item name="invoiceNotification" valuePropName="checked" className="!mb-0">
                          <Switch />
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                  {/* Communication API Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-600" /> Gateway API Tokens & Keys
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="SMS Gateway API Key" name="smsGatewayApiKey">
                        <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} />
                      </Form.Item>

                      <Form.Item label="WhatsApp Business API Token" name="whatsAppBusinessToken">
                        <Input.Password prefix={<Lock className="w-4 h-4 text-slate-400" />} />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "numbering",
              label: (
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-sky-600" /> Numbering & Billing
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  {/* Section 6: Document Numbering Policies */}
                  <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-200/60 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-sky-600" /> Enterprise Document & Registration Numbering Prefixes
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Form.Item label="Universal Health ID (UHID) Prefix" name="uhidPrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="UHID-APL-" size="large" />
                      </Form.Item>

                      <Form.Item label="Medical Record # (MRN) Prefix" name="mrnPrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="MRN-2026-" size="large" />
                      </Form.Item>

                      <Form.Item label="OPD Encounter ID Prefix" name="encounterPrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="ENC-" size="large" />
                      </Form.Item>

                      <Form.Item label="IPD Admission ID Prefix" name="admissionPrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="ADM-" size="large" />
                      </Form.Item>

                      <Form.Item label="Lab Order Sample Prefix" name="labOrderPrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="LAB-" size="large" />
                      </Form.Item>

                      <Form.Item label="Billing Invoice Prefix" name="invoicePrefix" rules={[{ required: true }]}>
                        <Input prefix={<Hash className="w-4 h-4 text-sky-600" />} placeholder="INV-2026-" size="large" />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Billing & Tax Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-slate-600" /> Billing & Tax Defaults
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="Default GST Tax Rate (%)" name="defaultGstRatePercent">
                        <Select size="large">
                          <Select.Option value={0}>0% (Exempt)</Select.Option>
                          <Select.Option value={5}>5% Healthcare GST</Select.Option>
                          <Select.Option value={12}>12% Standard Medical</Select.Option>
                          <Select.Option value={18}>18% Diagnostic & Tech</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Currency Symbol" name="currencySymbol">
                        <Input size="large" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item label="Minimum TPA Cashless Admission Deposit (₹)" name="tpaCashlessMinDeposit">
                        <InputNumber min={0} max={100000} className="w-full" size="large" />
                      </Form.Item>

                      <Form.Item label="Max Staff Billing Discount Limit (%)" name="maxStaffDiscountPercent">
                        <InputNumber min={0} max={50} className="w-full" size="large" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </div>
  );
};
