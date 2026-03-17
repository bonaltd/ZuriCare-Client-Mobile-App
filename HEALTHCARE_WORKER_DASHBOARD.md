# ZuriCare Healthcare Worker Dashboard – Full Documentation

> **Purpose:** Web-based dashboard for clinics and healthcare workers to manage patients who use the ZuriCare mobile app. This document defines the complete specification for the healthcare worker dashboard.

---

## 1. Executive Summary

The **ZuriCare Healthcare Worker Dashboard** is a web application used by clinics, hospitals, NGOs, and healthcare providers in Eastern and Southern Africa. It complements the **ZuriCare Patient Mobile App** by enabling:

- **Patient registration** and profile creation
- **QR code scanning** to identify patients and request access to their health data
- **Consent-based data access** with granular scope selection
- **Medical summary viewing** of shared patient information
- **Prescription and medical history management**
- **Audit and compliance** tracking of all access events

The dashboard follows the same principles as the patient app: **privacy-first**, **consent-based**, and **MOSIP-aligned** for digital identity.

---

## 2. Vision & Alignment

### 2.1 ZuriCare Ecosystem

| Component | Purpose | Users |
|-----------|---------|-------|
| **Patient Mobile App** | Digital health identity, consent, self-screening, health education | Patients (refugees, migrants, international patients) |
| **Healthcare Worker Dashboard** | Patient management, access requests, medical data viewing | Clinics, doctors, nurses, NGO staff |

### 2.2 Key Principles

- **Patient-centric:** Patients own their data and grant access via explicit consent.
- **Minimal data:** Only essential health information (allergies, blood type, chronic conditions, vaccinations, prescriptions, emergency contact) is shared.
- **Audit everything:** All access requests and grants/denials are logged.
- **Offline-aware:** Dashboard should support low-connectivity environments where possible.

---

## 3. User Roles

### 3.1 Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Clinic Admin** | Manages clinic settings, staff, and facility info | Full clinic management, user management, all patient actions |
| **Doctor / Clinician** | Primary care provider | Register patients, request access, view medical summary, add prescriptions |
| **Nurse** | Clinical support staff | Register patients, request access, view medical summary (read-only prescriptions) |
| **Receptionist / Registration Officer** | Front-desk staff | Register patients, scan QR, initiate access requests |
| **NGO / Refugee Support Worker** | Non-clinical support | Register patients, limited access requests (e.g., for referrals) |

### 3.2 Role-Based Access Control (RBAC)

- Each user is linked to a **clinic/facility**.
- Permissions are configurable per role.
- Audit logs capture which user performed each action.

---

## 4. Dashboard Modules & Screens

### 4.1 Module Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTHCARE WORKER DASHBOARD                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Dashboard  │ │   Patients  │ │   Scan QR   │ │   Consent   │ │
│  │   (Home)    │ │   (Search)  │ │   (Lookup)  │ │   Requests  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Medical   │ │ Prescription│ │  Audit Log  │ │   Clinic    │ │
│  │   Summary   │ │   History   │ │             │ │   Settings  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Screen Specifications

#### 4.2.1 Dashboard (Home)

**Purpose:** Overview and quick actions for the healthcare worker.

**Content:**
- **Welcome message** with user name and clinic name
- **Quick stats:** Patients registered today, pending consent requests, recent access events
- **Quick actions:**
  - Register new patient
  - Scan patient QR
  - View pending consent requests
- **Recent activity feed:** Last 10 access events (patient, action, timestamp)
- **Notifications:** Pending consent responses, system alerts

**User stories:**
- As a doctor, I want to see today’s activity at a glance.
- As a nurse, I want quick access to register a patient or scan a QR.

---

#### 4.2.2 Patient Registration

**Purpose:** Enroll new patients into ZuriCare and create their health profile.

**Workflow:**
1. Healthcare worker selects **Register new patient**
2. **Step 1 – Identity verification (MOSIP-style):**
   - Enter national ID / refugee ID / passport number (if available)
   - Optional: Biometric verification (fingerprint, face) via MOSIP integration
   - System returns verified demographic data (name, DOB, nationality) or allows manual entry
3. **Step 2 – Demographics:**
   - Full name
   - Date of birth
   - Nationality
   - Phone number
   - Email (optional)
4. **Step 3 – Health profile:**
   - Allergies (multi-select or free text)
   - Blood type
   - Chronic conditions
   - Vaccination history
   - Emergency contact (name, relationship, phone)
5. **Step 4 – Prescription history (optional):**
   - Add current/previous prescriptions (medication, dosage, prescriber, date, condition)
6. **Step 5 – Generate ZuriCare ID & QR:**
   - System generates ZuriCare ID (e.g., `ZC-20240315-ABC123`)
   - QR code generated for patient
   - **Print or share:** Option to print QR card or send link/SMS to patient for app download

**Data stored:**
- Patient record linked to ZuriCare ID
- Health profile (synced to patient app when they register)
- Registration audit log entry

**User stories:**
- As a clinic admin, I want to register a refugee patient who has no national ID.
- As a doctor, I want to add a patient’s allergies and chronic conditions during registration.

---

#### 4.2.3 Scan QR / Patient Lookup

**Purpose:** Identify a patient and request access to their health data.

**Workflow:**
1. Healthcare worker selects **Scan patient QR** or **Lookup by ZuriCare ID**
2. **Option A – Scan QR:**
   - Use device camera or barcode scanner to scan patient’s QR code
   - QR contains: ZuriCare ID + optional signed payload (Inji Verify compatible)
   - System decodes and retrieves patient record
3. **Option B – Manual lookup:**
   - Enter ZuriCare ID (e.g., `ZC-DEMO-NKOSBONA`)
   - Search by name or phone (if permitted by clinic policy)
4. **Patient found:**
   - Display: Name, ZuriCare ID, last access date
   - Action: **Request access** → Opens consent request flow
5. **Patient not found:**
   - Option to register new patient

**Technical notes:**
- QR format: Standard QR with ZuriCare ID; optional CBOR-encoded verifiable credential for Inji Verify
- Offline: Cache recently scanned patients for lookup when offline

**User stories:**
- As a nurse, I want to scan a patient’s QR when they arrive at the clinic.
- As a doctor, I want to look up a patient by ZuriCare ID if they don’t have their phone.

---

#### 4.2.4 Consent Request

**Purpose:** Request access to patient data with granular scope selection.

**Workflow:**
1. Healthcare worker selects patient (from scan or lookup)
2. **Select data scopes** to request:
   - [ ] Allergies
   - [ ] Blood type
   - [ ] Chronic conditions
   - [ ] Vaccination history
   - [ ] Medical history (prescriptions)
   - [ ] Emergency contact
3. **Add reason** (optional): e.g., "Routine check-up", "Emergency care"
4. **Send request** → Request is pushed to patient’s mobile app
5. **Wait for response:**
   - Patient sees consent screen in app
   - Patient accepts (all or selected scopes) or denies
6. **Dashboard updates:**
   - If accepted: Navigate to Medical Summary with granted scopes
   - If denied: Show notification; no data access
   - If timeout (e.g., 24 hours): Request expires

**Request state:**
- `pending` – Awaiting patient response
- `granted` – Patient accepted; data accessible
- `denied` – Patient declined
- `expired` – No response within timeout

**User stories:**
- As a doctor, I want to request only allergies and blood type for a quick check.
- As a clinician, I want to request full medical history for a comprehensive visit.

---

#### 4.2.5 Medical Summary

**Purpose:** View patient health data shared via consent.

**Content (per scope):**
- **Allergies:** List of allergies
- **Blood type:** Blood type
- **Chronic conditions:** List of conditions
- **Vaccination history:** List of vaccinations
- **Medical history (prescriptions):** Detailed prescription history (see below)
- **Emergency contact:** Name, relationship, phone

**Layout:**
- Clear section headers
- Read-only display (no editing from this view)
- **Timestamp:** When consent was granted
- **Expiry:** Optional consent expiry (e.g., single visit, 24 hours, 30 days)

**User stories:**
- As a doctor, I want to see a patient’s allergies before prescribing.
- As a nurse, I want to verify vaccination history before administering a vaccine.

---

#### 4.2.6 Prescription History (Medical History)

**Purpose:** View and manage prescription history for a patient.

**View mode:**
- Table or card list of prescriptions
- Columns: Medication, Dosage, Prescriber, Date, Duration, Condition, Pharmacy, Status (active/completed)
- Filter by: status, date range, prescriber

**Edit mode (Doctor/Clinician only):**
- Add new prescription
- Update existing prescription (e.g., mark as completed)
- Fields: Medication name, dosage, prescriber, date prescribed, duration, condition, pharmacy

**Sync:**
- Prescriptions added via dashboard sync to patient app (when patient next opens app)
- Patient app displays prescription history in Medical Summary

**User stories:**
- As a doctor, I want to add a new prescription after a consultation.
- As a clinician, I want to view a patient’s current medications to avoid interactions.

---

#### 4.2.7 Patient List / Search

**Purpose:** Browse and search registered patients.

**Features:**
- Search by: name, ZuriCare ID, phone
- Filter by: registration date, clinic, last visit
- Sort by: name, date, last access
- Pagination: 20–50 per page

**Actions per patient:**
- View profile summary
- Request access (consent flow)
- View medical summary (if consent already granted)
- Edit profile (if permitted by role)

**Privacy:**
- Only show patients linked to the user’s clinic
- Audit log entry for each access

---

#### 4.2.8 Consent Requests (Pending)

**Purpose:** Track and manage pending consent requests.

**Content:**
- List of pending requests: Patient name, ZuriCare ID, requested scopes, sent time
- Status: Pending, Granted, Denied, Expired
- Action: Resend request, cancel request

**User stories:**
- As a receptionist, I want to see which patients haven’t responded to consent requests.
- As a doctor, I want to know when a patient has granted access.

---

#### 4.2.9 Audit Log

**Purpose:** Compliance and transparency – all access events are logged.

**Content:**
- Table: Timestamp, User, Patient (ZuriCare ID), Action, Result, Scopes (if applicable)
- Actions: Registration, Access request, Consent granted, Consent denied, Medical summary viewed

**Filters:**
- Date range
- User
- Patient
- Action type

**Export:**
- CSV/PDF export for compliance
- Retention: Configurable (e.g., 7 years)

**User stories:**
- As a clinic admin, I want to audit who accessed which patient’s data.
- As a compliance officer, I want to export audit logs for regulatory reporting.

---

#### 4.2.10 Clinic Settings

**Purpose:** Manage clinic/facility configuration.

**Content:**
- **Clinic info:** Name, address, phone, type (clinic, hospital, NGO)
- **Services:** Service types offered (e.g., vaccinations, maternal care, refugee support)
- **Staff:** List of users, roles, invite new user
- **Integration:** MOSIP config, API keys (if applicable)
- **Consent defaults:** Default scopes for new requests, timeout duration

**User stories:**
- As a clinic admin, I want to add a new doctor to the clinic.
- As a clinic admin, I want to set the default consent timeout to 24 hours.

---

## 5. Data Model & Integration

### 5.1 Patient Data (Shared with Patient App)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| zuriCareId | string | Dashboard | Unique ID |
| fullName | string | Dashboard | |
| dateOfBirth | string | Dashboard | ISO date |
| nationality | string | Dashboard | |
| phone | string | Dashboard | |
| email | string | Dashboard | Optional |
| allergies | string[] | Dashboard | |
| bloodType | string | Dashboard | |
| chronicConditions | string[] | Dashboard | |
| vaccinationHistory | string[] | Dashboard | |
| emergencyContact | object | Dashboard | name, relationship, phone |
| prescriptionHistory | array | Dashboard | See prescription schema |

### 5.2 Prescription Schema

```json
{
  "id": "uuid",
  "medicationName": "string",
  "dosage": "string",
  "prescriber": "string",
  "datePrescribed": "ISO date",
  "duration": "string",
  "condition": "string",
  "pharmacy": "string",
  "status": "active | completed"
}
```

### 5.3 Consent & Access

| Field | Type | Description |
|-------|------|-------------|
| requestId | string | Unique request ID |
| patientId | string | ZuriCare ID |
| requesterId | string | Dashboard user ID |
| clinicId | string | Clinic/facility ID |
| scopes | string[] | Requested data scopes |
| status | enum | pending, granted, denied, expired |
| grantedScopes | string[] | Scopes patient agreed to (if granted) |
| createdAt | timestamp | |
| respondedAt | timestamp | |
| expiresAt | timestamp | |

### 5.4 Integration with Patient App

- **Data flow:** Dashboard is source of truth for patient profile. Patient app syncs when online.
- **Consent flow:** Dashboard sends request → Patient app receives → Patient grants/denies → Dashboard receives response.
- **API:** REST or GraphQL endpoints. Patient app polls or uses push notifications for updates.
- **Offline:** Patient app stores data locally; syncs when back online.

---

## 6. Privacy & Consent

### 6.1 Consent Principles

- **Explicit consent:** Patient must actively grant access; no implicit consent.
- **Granular:** Patient can choose which scopes to share (e.g., allergies only).
- **Scope-limited:** Only requested and granted scopes are visible.
- **Auditable:** Every access is logged.

### 6.2 Consent Scopes (Aligned with Patient App)

| Scope | Key | Description |
|-------|-----|-------------|
| Allergies | allergies | Drug/food allergies |
| Blood type | bloodType | ABO/Rh |
| Chronic conditions | chronicConditions | e.g., Asthma, diabetes |
| Vaccination history | vaccinationHistory | Vaccines received |
| Medical history | prescriptionHistory | Prescription records |
| Emergency contact | emergencyContact | Name, relationship, phone |

### 6.3 Consent Expiry

- **Single visit:** Access valid for one session only
- **24 hours:** Access valid for 24 hours from grant
- **30 days:** Access valid for 30 days (configurable)
- **Revocation:** Patient can revoke consent from app; dashboard must respect this.

---

## 7. Technical Requirements

### 7.1 Technology Stack (Recommended)

| Layer | Technology |
|-------|------------|
| Frontend | React, Vue, or Angular; responsive design |
| Backend | Node.js, Python (Django/FastAPI), or Java (Spring) |
| Database | PostgreSQL (recommended for audit, compliance) |
| Auth | JWT, OAuth2; role-based access |
| QR | Standard QR code library; optional Inji Verify SDK |
| Real-time | WebSockets or polling for consent status |

### 7.2 Security

- **HTTPS:** All traffic encrypted
- **Authentication:** Strong password policy; optional MFA
- **Authorization:** RBAC per role
- **Data encryption:** At rest and in transit
- **Audit:** Immutable audit logs

### 7.3 Compliance

- **GDPR / local data protection:** Patient data handling, retention, right to erasure
- **Healthcare regulations:** HIPAA (if applicable), local health data laws
- **MOSIP:** Alignment with MOSIP identity verification standards

---

## 8. Integration with MOSIP & Inji Verify

### 8.1 MOSIP Integration

- **Registration:** Use MOSIP APIs for identity verification during patient registration
- **Demographic lookup:** Fetch verified name, DOB, nationality from MOSIP
- **Biometric:** Optional fingerprint/face verification via MOSIP

### 8.2 Inji Verify Integration

- **QR verification:** Patient QR may contain verifiable credential (VC)
- **Dashboard:** Use Inji Verify SDK to validate QR codes
- **Offline:** Inji Verify supports offline credential validation

---

## 9. User Stories (Summary)

| User | Story |
|------|-------|
| Doctor | Register a new patient with full health profile |
| Doctor | Scan patient QR and request access to allergies and prescriptions |
| Doctor | View medical summary after patient grants consent |
| Doctor | Add prescription after consultation |
| Nurse | Look up patient by ZuriCare ID and request access |
| Nurse | View vaccination history before administering vaccine |
| Receptionist | Register patient and print QR card |
| Receptionist | See pending consent requests |
| Clinic Admin | Manage clinic staff and settings |
| Clinic Admin | Export audit log for compliance |

---

## 10. Future Enhancements

- **Multi-facility:** Support clinics with multiple locations
- **Referrals:** Refer patient to another clinic/provider
- **Appointments:** Link to appointment scheduling
- **Lab results:** Integrate lab systems for results (with consent)
- **Telehealth:** Video consultation integration
- **Offline mode:** Dashboard works with limited connectivity
- **Mobile app for providers:** Lightweight provider app for field workers

---

## 11. Appendix

### A. Glossary

- **ZuriCare ID:** Unique identifier for each patient (e.g., ZC-20240315-ABC123)
- **Scope:** A category of health data (e.g., allergies, prescriptions)
- **Consent:** Patient’s explicit permission to share specific scopes with a provider
- **MOSIP:** Modular Open Source Identity Platform
- **Inji Verify:** Tool for verifying digital credentials from QR codes

### B. Consent Screen (Patient App) – Reference

The patient app shows a consent screen when a provider requests access. The patient sees:
- Requester name (e.g., "Dr. Demo Clinic")
- List of requested scopes (checkboxes)
- Allow / Deny buttons

This document defines the dashboard side that initiates these requests.

---

## Document Summary

This specification defines the **Healthcare Worker Dashboard** for ZuriCare: a web application for clinics to register patients, scan QR codes, request consent-based access, view medical summaries, manage prescriptions, and maintain audit logs. It is designed to work alongside the ZuriCare Patient Mobile App in Eastern and Southern Africa, supporting refugees, migrants, and international patients with a privacy-first, consent-based digital health identity system.
