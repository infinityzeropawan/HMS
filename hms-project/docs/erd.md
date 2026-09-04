# HMS Entity Relationship Diagram & Complete PostgreSQL Schema

<!-- Source: Extracted PostgreSQL DDL statements from architecture.md Sections 0 to 12 -->

## 0. Common Extensions & Conventions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search on names/mobile

-- Standard audit columns present on all tenant tables:
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
-- tenant_id UUID NOT NULL,
-- hospital_id UUID NOT NULL,
-- created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
-- updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
-- created_by UUID,
-- updated_by UUID,
-- deleted_at TIMESTAMPTZ  -- soft delete
```

---

## 1. Super Admin Domain (Platform Level)

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200),
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    tenant_type VARCHAR(30) CHECK (tenant_type IN ('clinic','nursing_home','multi_specialty','hospital_chain')),
    isolation_mode VARCHAR(20) NOT NULL DEFAULT 'shared_rls' CHECK (isolation_mode IN ('shared_rls','dedicated_schema','dedicated_db')),
    db_connection_ref VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('trial','active','suspended','terminated')),
    country VARCHAR(2) DEFAULT 'IN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    price_monthly NUMERIC(10,2),
    price_yearly NUMERIC(10,2),
    max_users INT,
    max_beds INT,
    modules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    billing_cycle VARCHAR(10) CHECK (billing_cycle IN ('monthly','yearly')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','past_due')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    feature_key VARCHAR(80) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    UNIQUE(tenant_id, feature_key)
);

CREATE TABLE global_masters_drug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_code VARCHAR(50) UNIQUE,
    generic_name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(200),
    composition VARCHAR(300),
    schedule_class VARCHAR(10),
    is_controlled BOOLEAN DEFAULT false,
    cdsco_approved BOOLEAN DEFAULT true,
    hsn_code VARCHAR(20),
    gst_rate NUMERIC(4,2)
);

CREATE TABLE global_masters_icd10 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE global_masters_snomed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id VARCHAR(20) UNIQUE NOT NULL,
    term TEXT NOT NULL
);

CREATE TABLE global_masters_loinc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loinc_code VARCHAR(20) UNIQUE NOT NULL,
    component TEXT,
    test_name TEXT
);

CREATE TABLE global_masters_lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_code VARCHAR(30) UNIQUE,
    test_name VARCHAR(150),
    loinc_id UUID REFERENCES global_masters_loinc(id),
    specimen_type VARCHAR(50),
    default_unit VARCHAR(20),
    ref_range_male VARCHAR(50),
    ref_range_female VARCHAR(50)
);

CREATE TABLE platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    tenant_id UUID,
    action VARCHAR(100),
    entity VARCHAR(100),
    entity_id UUID,
    ip_address VARCHAR(45),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    raised_by UUID,
    category VARCHAR(50),
    priority VARCHAR(10) CHECK (priority IN ('low','medium','high','critical')),
    status VARCHAR(20) DEFAULT 'open',
    subject VARCHAR(200),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
```

---

## 2. Hospital Admin Domain

```sql
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(30) CHECK (facility_type IN ('clinic','nursing_home','multi_specialty_hospital','medical_college','chain_headquarter')),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    address JSONB,
    phone VARCHAR(15),
    email VARCHAR(150),
    logo_url TEXT,
    nabh_accredited BOOLEAN DEFAULT false,
    nabl_accredited BOOLEAN DEFAULT false,
    accreditation_expiry DATE,
    hfr_id VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    UNIQUE(hospital_id, setting_key)
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    name VARCHAR(100) NOT NULL,
    department_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    department_id UUID REFERENCES departments(id),
    name VARCHAR(100) NOT NULL,
    ward_type VARCHAR(30) CHECK (ward_type IN ('general','semi_private','private','icu','nicu','picu','hdu','isolation')),
    floor VARCHAR(20)
);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    ward_id UUID NOT NULL REFERENCES wards(id),
    bed_number VARCHAR(20) NOT NULL,
    bed_type VARCHAR(30),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','cleaning','maintenance','blocked')),
    daily_rate NUMERIC(10,2),
    UNIQUE(ward_id, bed_number)
);

CREATE TABLE print_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    template_type VARCHAR(50) CHECK (template_type IN ('prescription','invoice','discharge_summary','lab_report','consent_form')),
    language VARCHAR(10) DEFAULT 'en',
    layout_html TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false
);

CREATE TABLE facility_accreditations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    accreditation_type VARCHAR(30) CHECK (accreditation_type IN ('NABH','NABL','ISO','JCI','other')),
    certificate_number VARCHAR(100),
    issued_date DATE,
    expiry_date DATE,
    document_url TEXT
);
```

---

## 3. Identity, RBAC, HR & Payroll

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    employee_code VARCHAR(30),
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) UNIQUE,
    email VARCHAR(150),
    password_hash TEXT,
    user_type VARCHAR(30) CHECK (user_type IN ('super_admin','hospital_admin','doctor','nurse','receptionist','pharmacist','lab_tech','pathologist','radiologist','billing','tpa_executive','hr','patient')),
    nmc_registration_no VARCHAR(50),
    specialization VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID,
    role_name VARCHAR(80) NOT NULL,
    is_system_role BOOLEAN DEFAULT false
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50),
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    refresh_token_hash TEXT,
    device_info JSONB,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    department_id UUID REFERENCES departments(id),
    shift_name VARCHAR(50),
    start_time TIME,
    end_time TIME
);

CREATE TABLE shift_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    ward_id UUID REFERENCES wards(id),
    shift_id UUID NOT NULL REFERENCES staff_shifts(id),
    roster_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','present','absent','swapped','on_leave'))
);

CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    leave_code VARCHAR(20),
    leave_name VARCHAR(50),
    default_annual_quota INT
);

CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INT NOT NULL,
    balance NUMERIC(5,1) DEFAULT 0,
    carried_forward NUMERIC(5,1) DEFAULT 0,
    UNIQUE(user_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    from_date DATE,
    to_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
    approved_by UUID REFERENCES users(id)
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    attendance_date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status VARCHAR(20) CHECK (status IN ('present','absent','half_day','leave','holiday'))
);

CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    month INT,
    year INT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','processed','paid')),
    processed_at TIMESTAMPTZ
);

CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES payroll_runs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    basic_pay NUMERIC(10,2),
    allowances NUMERIC(10,2),
    deductions NUMERIC(10,2),
    net_pay NUMERIC(10,2),
    pdf_url TEXT
);

CREATE TABLE doctor_payout_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    doctor_id UUID NOT NULL REFERENCES users(id),
    service_category VARCHAR(50),
    payout_type VARCHAR(20) CHECK (payout_type IN ('percentage','flat','tiered')),
    payout_value NUMERIC(10,2),
    deduct_consumables BOOLEAN DEFAULT false,
    effective_from DATE,
    effective_to DATE
);

CREATE TABLE doctor_payout_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    doctor_id UUID NOT NULL REFERENCES users(id),
    invoice_id UUID,
    rule_id UUID REFERENCES doctor_payout_rules(id),
    gross_amount NUMERIC(12,2),
    payout_amount NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','disputed')),
    period_month INT,
    period_year INT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Patient / Reception Domain

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    uhid VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('male','female','other')),
    date_of_birth DATE,
    age_years INT,
    mobile VARCHAR(15),
    alternate_mobile VARCHAR(15),
    email VARCHAR(150),
    address JSONB,
    blood_group VARCHAR(5),
    abha_number VARCHAR(20),
    abha_address VARCHAR(100),
    aadhaar_masked VARCHAR(20),
    marital_status VARCHAR(20),
    occupation VARCHAR(100),
    photo_url TEXT,
    is_vip BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(hospital_id, uhid)
);
CREATE INDEX idx_patients_mobile ON patients USING gin (mobile gin_trgm_ops);

CREATE TABLE patient_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    identifier_type VARCHAR(30) CHECK (identifier_type IN ('abha','aadhaar_ref','passport','voter_id','driving_license','insurance_id','corporate_id')),
    identifier_value TEXT NOT NULL,
    verified BOOLEAN DEFAULT false
);

CREATE TABLE patient_insurance_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    insurance_provider_id UUID,
    policy_number VARCHAR(50),
    tpa_id UUID,
    sum_insured NUMERIC(12,2),
    valid_from DATE,
    valid_to DATE,
    card_document_url TEXT
);

CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    allergen VARCHAR(150),
    reaction VARCHAR(200),
    severity VARCHAR(20) CHECK (severity IN ('mild','moderate','severe')),
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE data_collection_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    field_name VARCHAR(50),
    is_required BOOLEAN DEFAULT false,
    is_enabled BOOLEAN DEFAULT true
);
```

---

## 5. Appointment & Queue

```sql
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    doctor_id UUID NOT NULL REFERENCES users(id),
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME,
    end_time TIME,
    slot_duration_minutes INT DEFAULT 15,
    max_patients_per_slot INT DEFAULT 1,
    valid_from DATE,
    valid_to DATE
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    appointment_date DATE NOT NULL,
    slot_time TIME,
    booking_channel VARCHAR(20) CHECK (booking_channel IN ('walk_in','phone','app','web','ivr')),
    status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked','checked_in','in_consultation','completed','cancelled','no_show')),
    is_teleconsultation BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE queue_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    token_number INT,
    counter VARCHAR(20),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','called','skipped','served')),
    called_at TIMESTAMPTZ
);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID,
    channel VARCHAR(20) CHECK (channel IN ('sms','whatsapp','email','push')),
    priority VARCHAR(10) CHECK (priority IN ('critical','normal','low')),
    template_key VARCHAR(50),
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','delivered')),
    sent_at TIMESTAMPTZ
);
```

---

## 6. Clinical / EHR (Doctor Domain)

```sql
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    encounter_type VARCHAR(20) CHECK (encounter_type IN ('opd','emergency','ipd','teleconsult','follow_up')),
    encounter_status VARCHAR(20) DEFAULT 'open' CHECK (encounter_status IN ('open','closed','cancelled')),
    chief_complaint TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID REFERENCES encounters(id),
    admission_id UUID,
    patient_id UUID NOT NULL REFERENCES patients(id),
    recorded_by UUID REFERENCES users(id),
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    bmi NUMERIC(5,2),
    temperature_c NUMERIC(4,1),
    pulse_bpm INT,
    resp_rate INT,
    bp_systolic INT,
    bp_diastolic INT,
    spo2 INT,
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    note_type VARCHAR(20) DEFAULT 'soap' CHECK (note_type IN ('soap','progress','nursing','discharge')),
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    signed_by UUID REFERENCES users(id),
    signed_at TIMESTAMPTZ,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    icd10_id UUID REFERENCES global_masters_icd10(id),
    snomed_id UUID REFERENCES global_masters_snomed(id),
    diagnosis_type VARCHAR(20) CHECK (diagnosis_type IN ('provisional','confirmed','differential','rule_out')),
    notes TEXT,
    diagnosed_by UUID REFERENCES users(id)
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','dispensed','partially_dispensed','cancelled')),
    is_teleconsult BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    drug_id UUID NOT NULL REFERENCES global_masters_drug(id),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    route VARCHAR(30),
    duration_days INT,
    instructions TEXT,
    is_substitutable BOOLEAN DEFAULT true
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    referred_to_doctor_id UUID REFERENCES users(id),
    referred_to_hospital VARCHAR(200),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE teleconsultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    doctor_nmc_verified BOOLEAN DEFAULT false,
    consent_recorded_at TIMESTAMPTZ,
    session_start TIMESTAMPTZ,
    session_end TIMESTAMPTZ,
    recording_url TEXT,
    mode VARCHAR(20) CHECK (mode IN ('video','audio','chat'))
);
```

---

## 7. Nursing / IPD / OT

```sql
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    admitting_doctor_id UUID REFERENCES users(id),
    bed_id UUID NOT NULL REFERENCES beds(id),
    admission_type VARCHAR(20) CHECK (admission_type IN ('planned','emergency','transfer_in')),
    admission_date TIMESTAMPTZ DEFAULT now(),
    discharge_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'admitted' CHECK (status IN ('admitted','discharged','dama','deceased','transferred_out'))
);

CREATE TABLE bed_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    from_bed_id UUID REFERENCES beds(id),
    to_bed_id UUID REFERENCES beds(id),
    reason TEXT,
    transferred_by UUID REFERENCES users(id),
    transferred_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE nursing_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    note_text TEXT,
    intake_ml NUMERIC(6,1),
    output_ml NUMERIC(6,1),
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE medication_administration_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    prescription_item_id UUID REFERENCES prescription_items(id),
    scheduled_time TIMESTAMPTZ,
    administered_time TIMESTAMPTZ,
    administered_by UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('scheduled','given','missed','refused','held')),
    remarks TEXT
);

CREATE TABLE diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    diet_type VARCHAR(50),
    instructions TEXT,
    prescribed_by UUID REFERENCES users(id)
);

CREATE TABLE shift_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    ward_id UUID NOT NULL REFERENCES wards(id),
    from_nurse_id UUID REFERENCES users(id),
    to_nurse_id UUID REFERENCES users(id),
    summary JSONB,
    handover_time TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE discharge_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    diagnosis_summary TEXT,
    treatment_summary TEXT,
    discharge_medications JSONB,
    follow_up_date DATE,
    signed_by UUID REFERENCES users(id),
    signed_at TIMESTAMPTZ,
    version INT DEFAULT 1
);

CREATE TABLE ot_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    room_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE ot_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    ot_room_id UUID NOT NULL REFERENCES ot_rooms(id),
    admission_id UUID REFERENCES admissions(id),
    surgeon_id UUID REFERENCES users(id),
    anesthetist_id UUID REFERENCES users(id),
    surgery_name VARCHAR(200),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled','postponed'))
);

CREATE TABLE ot_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ot_booking_id UUID NOT NULL REFERENCES ot_bookings(id),
    checklist_phase VARCHAR(20) CHECK (checklist_phase IN ('sign_in','time_out','sign_out')),
    checklist_data JSONB,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ
);

CREATE TABLE anesthesia_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ot_booking_id UUID NOT NULL REFERENCES ot_bookings(id),
    anesthesia_type VARCHAR(30),
    notes TEXT,
    recorded_by UUID REFERENCES users(id)
);

CREATE TABLE surgical_implants_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ot_booking_id UUID NOT NULL REFERENCES ot_bookings(id),
    item_name VARCHAR(150),
    batch_number VARCHAR(50),
    quantity INT,
    unit_cost NUMERIC(10,2)
);

CREATE TABLE post_op_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ot_booking_id UUID NOT NULL REFERENCES ot_bookings(id),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Pharmacy & Inventory

```sql
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    item_type VARCHAR(20) CHECK (item_type IN ('drug','consumable','implant','equipment')),
    drug_id UUID REFERENCES global_masters_drug(id),
    item_name VARCHAR(200) NOT NULL,
    unit_of_measure VARCHAR(20),
    reorder_level INT,
    max_level INT
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    name VARCHAR(200),
    gstin VARCHAR(15),
    contact_details JSONB
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    po_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','sent','partially_received','received','cancelled')),
    order_date DATE,
    expected_date DATE
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    quantity INT,
    unit_price NUMERIC(10,2),
    gst_rate NUMERIC(4,2)
);

CREATE TABLE stock_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    batch_number VARCHAR(50),
    manufacturing_date DATE,
    expiry_date DATE,
    quantity_received INT,
    quantity_available INT,
    purchase_price NUMERIC(10,2),
    mrp NUMERIC(10,2),
    supplier_id UUID REFERENCES suppliers(id)
);

CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    stock_batch_id UUID NOT NULL REFERENCES stock_batches(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('receipt','dispense','return','adjustment','transfer','expired_writeoff')),
    quantity INT NOT NULL,
    reference_type VARCHAR(30),
    reference_id UUID,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dispenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    prescription_item_id UUID NOT NULL REFERENCES prescription_items(id),
    stock_batch_id UUID NOT NULL REFERENCES stock_batches(id),
    quantity_dispensed INT,
    substitution_flag BOOLEAN DEFAULT false,
    substitution_reason VARCHAR(30) CHECK (substitution_reason IN ('patient_request','stock_unavailable','doctor_approved','generic_policy')),
    dispensed_by UUID NOT NULL REFERENCES users(id),
    dispensed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE controlled_drug_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    dispense_id UUID NOT NULL REFERENCES dispenses(id),
    drug_id UUID NOT NULL REFERENCES global_masters_drug(id),
    schedule_class VARCHAR(10),
    prescriber_registration_no VARCHAR(50),
    patient_id_proof VARCHAR(50),
    recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Laboratory & Radiology (LIS / RIS / PACS / Blood Bank)

```sql
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    ordered_by UUID REFERENCES users(id),
    priority VARCHAR(10) CHECK (priority IN ('routine','urgent','stat')),
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered','sample_collected','in_process','resulted','approved','rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id),
    test_id UUID NOT NULL REFERENCES global_masters_lab_tests(id),
    barcode VARCHAR(50) UNIQUE,
    specimen_status VARCHAR(20) CHECK (specimen_status IN ('pending','collected','in_transit','received','rejected')),
    rejection_reason TEXT
);

CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_item_id UUID NOT NULL REFERENCES lab_order_items(id),
    result_value VARCHAR(100),
    unit VARCHAR(20),
    reference_range VARCHAR(50),
    is_abnormal BOOLEAN DEFAULT false,
    is_critical BOOLEAN DEFAULT false,
    analyzer_source VARCHAR(50),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ
);

CREATE TABLE critical_result_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_result_id UUID REFERENCES lab_results(id),
    notified_doctor_id UUID REFERENCES users(id),
    notified_at TIMESTAMPTZ DEFAULT now(),
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE radiology_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    ordered_by UUID REFERENCES users(id),
    modality VARCHAR(20) CHECK (modality IN ('xray','ct','mri','ultrasound','mammography')),
    body_part VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered','scheduled','in_progress','reported','approved'))
);

CREATE TABLE radiology_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radiology_order_id UUID NOT NULL REFERENCES radiology_orders(id),
    dicom_study_uid VARCHAR(100),
    pacs_url TEXT,
    findings TEXT,
    impression TEXT,
    reported_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ
);

CREATE TABLE blood_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    name VARCHAR(150),
    mobile VARCHAR(15),
    blood_group VARCHAR(5),
    last_donation_date DATE,
    screening_status VARCHAR(20) CHECK (screening_status IN ('eligible','deferred','rejected'))
);

CREATE TABLE blood_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    donor_id UUID REFERENCES blood_donors(id),
    unit_number VARCHAR(50) UNIQUE,
    blood_group VARCHAR(5),
    component_type VARCHAR(30) CHECK (component_type IN ('whole_blood','packed_rbc','plasma','platelets','cryoprecipitate')),
    collection_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','reserved','issued','discarded','expired'))
);

CREATE TABLE blood_cross_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_unit_id UUID NOT NULL REFERENCES blood_units(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    admission_id UUID REFERENCES admissions(id),
    compatibility_result VARCHAR(20) CHECK (compatibility_result IN ('compatible','incompatible')),
    tested_by UUID REFERENCES users(id),
    issued_at TIMESTAMPTZ
);
```

---

## 10. Billing, Insurance & TPA

```sql
CREATE TABLE service_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    service_code VARCHAR(30),
    service_name VARCHAR(200),
    department_id UUID REFERENCES departments(id),
    base_price NUMERIC(10,2),
    hsn_sac_code VARCHAR(20),
    gst_rate NUMERIC(4,2),
    is_package BOOLEAN DEFAULT false
);

CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_tariff_id UUID NOT NULL REFERENCES service_tariffs(id),
    included_service_id UUID NOT NULL REFERENCES service_tariffs(id),
    quantity INT DEFAULT 1
);

CREATE TABLE insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(150),
    provider_type VARCHAR(20) CHECK (provider_type IN ('insurance_company','tpa','corporate','government_scheme')),
    contact_details JSONB
);

CREATE TABLE rate_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    contract_name VARCHAR(150),
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE rate_contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_contract_id UUID NOT NULL REFERENCES rate_contracts(id),
    service_tariff_id UUID NOT NULL REFERENCES service_tariffs(id),
    negotiated_price NUMERIC(10,2)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    admission_id UUID REFERENCES admissions(id),
    invoice_number VARCHAR(50) UNIQUE,
    invoice_type VARCHAR(20) CHECK (invoice_type IN ('opd','ipd','pharmacy','lab','radiology','ot','package')),
    gross_amount NUMERIC(12,2),
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partially_paid','paid','refunded','cancelled')),
    gstin VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    service_tariff_id UUID REFERENCES service_tariffs(id),
    description VARCHAR(200),
    quantity INT DEFAULT 1,
    unit_price NUMERIC(10,2),
    hsn_sac_code VARCHAR(20),
    gst_rate NUMERIC(4,2),
    line_total NUMERIC(12,2)
);

CREATE TABLE discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    role_id UUID REFERENCES roles(id),
    max_discount_percent NUMERIC(5,2),
    requires_approval_above NUMERIC(5,2)
);

CREATE TABLE discount_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    requested_by UUID REFERENCES users(id),
    requested_percent NUMERIC(5,2),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount NUMERIC(12,2),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash','card','upi','net_banking','cheque','corporate_credit','insurance')),
    transaction_ref VARCHAR(100),
    gateway_response JSONB,
    collected_by UUID REFERENCES users(id),
    paid_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    amount NUMERIC(12,2),
    reason TEXT,
    approved_by UUID REFERENCES users(id),
    refunded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    admission_id UUID REFERENCES admissions(id),
    invoice_id UUID REFERENCES invoices(id),
    insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),
    claim_number VARCHAR(50),
    claimed_amount NUMERIC(12,2),
    approved_amount NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','preauth_requested','preauth_approved','submitted','query_raised','settled','rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id),
    document_type VARCHAR(50),
    document_url TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE claim_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id),
    settled_amount NUMERIC(12,2),
    deduction_amount NUMERIC(12,2),
    deduction_reason TEXT,
    settled_at TIMESTAMPTZ
);
```

---

## 11. ABDM, FHIR & Compliance

```sql
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    consent_type VARCHAR(30) CHECK (consent_type IN ('abha_link','record_share','teleconsult','data_processing','marketing')),
    status VARCHAR(20) DEFAULT 'granted' CHECK (status IN ('granted','revoked','expired')),
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE TABLE consent_artefacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    consent_id UUID NOT NULL REFERENCES consents(id),
    abdm_consent_artefact_id VARCHAR(100),
    hi_types JSONB,
    date_range_from DATE,
    date_range_to DATE,
    purpose_code VARCHAR(20),
    hip_id VARCHAR(50),
    hiu_id VARCHAR(50),
    granted_scope JSONB
);

CREATE TABLE data_processors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    processor_name VARCHAR(150),
    processor_type VARCHAR(50),
    dpa_signed BOOLEAN DEFAULT false,
    dpa_document_url TEXT,
    pii_access_scope JSONB
);

CREATE TABLE data_processor_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    processor_id UUID NOT NULL REFERENCES data_processors(id),
    patient_id UUID REFERENCES patients(id),
    accessed_fields JSONB,
    accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fhir_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    fhir_json JSONB NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE abdm_link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    abha_number VARCHAR(20),
    link_token VARCHAR(100),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated','otp_sent','verified','failed')),
    initiated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    user_id UUID,
    role VARCHAR(50),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE medication_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    admission_id UUID REFERENCES admissions(id),
    error_type VARCHAR(50),
    description TEXT,
    severity VARCHAR(20),
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE adverse_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id),
    event_type VARCHAR(50),
    description TEXT,
    severity VARCHAR(20),
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. Row-Level Security Policies (Applies to all tenant tables)

```sql
-- Pattern applied uniformly across all multi-tenant tables:
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patients ON patients
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid
           AND hospital_id = current_setting('app.current_hospital_id')::uuid);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_appointments ON appointments
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid AND hospital_id = current_setting('app.current_hospital_id')::uuid);

ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_encounters ON encounters
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid AND hospital_id = current_setting('app.current_hospital_id')::uuid);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_prescriptions ON prescriptions
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid AND hospital_id = current_setting('app.current_hospital_id')::uuid);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_invoices ON invoices
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid AND hospital_id = current_setting('app.current_hospital_id')::uuid);
```
