# ZuriCare Database Schema

MariaDB/MySQL schema for the ZuriCare ecosystem (Patient Mobile App + Healthcare Worker Dashboard).

## Quick Start

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE zuricare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run schema
mysql -u root -p zuricare < zuricare_schema.sql
```

## Entity Relationship Overview

```
clinics ──┬── clinic_services
          ├── clinic_staff ── roles
          ├── clinic_settings
          └── staff_invites

patients ──┬── patient_health_profiles
           ├── patient_allergies
           ├── patient_chronic_conditions
           ├── patient_vaccinations
           ├── patient_emergency_contacts
           ├── prescriptions ← clinic_staff (prescriber)
           ├── consent_requests ← clinic_staff, clinics
           ├── consent_revocations
           ├── screening_history
           ├── notifications
           ├── patient_devices
           └── mosip_registrations

audit_logs (references patients, clinic_staff)
```

## Tables Summary

| Table | Purpose |
|-------|---------|
| `clinics` | Healthcare facilities (clinics, hospitals, NGOs) |
| `clinic_services` | Services offered per clinic |
| `roles` | Dashboard user roles (admin, doctor, nurse, etc.) |
| `clinic_staff` | Healthcare workers with login credentials |
| `patients` | ZuriCare ID holders (mobile app users) |
| `patient_health_profiles` | Blood type |
| `patient_allergies` | Drug/food allergies |
| `patient_chronic_conditions` | e.g. Asthma, diabetes |
| `patient_vaccinations` | Vaccination history |
| `patient_emergency_contacts` | Emergency contact info |
| `prescriptions` | Medication history |
| `consent_requests` | Access requests & grants |
| `consent_revocations` | Patient revokes consent |
| `screening_history` | Self-screening results |
| `audit_logs` | All access events |
| `notifications` | Patient app notifications |
| `mosip_registrations` | MOSIP identity verification |
| `patient_devices` | Push tokens, sync state |
| `clinic_settings` | Per-clinic config |
| `staff_invites` | Pending staff invitations |

## Consent Scopes (JSON in consent_requests)

- `allergies`
- `bloodType`
- `chronicConditions`
- `vaccinationHistory`
- `prescriptionHistory`
- `emergencyContact`

## ID Format

- **Primary keys:** UUID (CHAR(36))
- **ZuriCare ID:** `ZC-YYYYMMDD-XXXXXX` (e.g. ZC-20240315-ABC123)
