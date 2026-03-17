/**
 * ZuriCare API - Patient authentication
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');

// Patient login: ZuriCare ID + PIN
router.post('/patient/login', async (req, res) => {
  try {
    const { zuriCareId, pin } = req.body;
    if (!zuriCareId || !pin) {
      return res.status(400).json({ error: 'ZuriCare ID and PIN required' });
    }
    const id = zuriCareId.trim().toUpperCase();
    const patient = await db.queryOne(
      'SELECT id, zuri_care_id, full_name, date_of_birth, nationality, phone, email, pin_hash FROM patients WHERE zuri_care_id = ?',
      [id]
    );
    if (!patient) {
      return res.status(401).json({ error: 'Invalid ZuriCare ID or PIN' });
    }
    const validPin = patient.pin_hash
      ? await bcrypt.compare(pin, patient.pin_hash)
      : pin === '1234'; // Demo fallback
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid ZuriCare ID or PIN' });
    }
    // Return profile (assembled by patients route)
    const profile = await assemblePatientProfile(patient.id);
    res.json({ success: true, patientId: patient.id, profile });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

async function assemblePatientProfile(patientId) {
  const [patient, profile, allergies, conditions, vaccinations, emergency, prescriptions] = await Promise.all([
    db.queryOne('SELECT * FROM patients WHERE id = ?', [patientId]),
    db.queryOne('SELECT blood_type FROM patient_health_profiles WHERE patient_id = ?', [patientId]),
    db.query('SELECT allergy FROM patient_allergies WHERE patient_id = ?', [patientId]),
    db.query('SELECT `condition` FROM patient_chronic_conditions WHERE patient_id = ?', [patientId]),
    db.query('SELECT vaccine_name, date_administered, notes FROM patient_vaccinations WHERE patient_id = ?', [patientId]),
    db.queryOne('SELECT name, relationship, phone FROM patient_emergency_contacts WHERE patient_id = ? AND is_primary = 1', [patientId]),
    db.query('SELECT id, medication_name, dosage, prescriber_name as prescriber, date_prescribed, duration, `condition`, pharmacy, status FROM prescriptions WHERE patient_id = ? ORDER BY date_prescribed DESC', [patientId]),
  ]);
  if (!patient) return null;
  const vacList = vaccinations.map((v) => v.notes || `${v.vaccine_name}${v.date_administered ? ` (${v.date_administered})` : ''}`);
  return {
    zuriCareId: patient.zuri_care_id,
    fullName: patient.full_name,
    dateOfBirth: patient.date_of_birth ? patient.date_of_birth.toISOString().slice(0, 10) : null,
    nationality: patient.nationality,
    phone: patient.phone,
    email: patient.email,
    allergies: allergies.map((a) => a.allergy),
    bloodType: profile?.blood_type || null,
    chronicConditions: conditions.map((c) => c.condition),
    vaccinationHistory: vacList.length ? vacList : ['None recorded'],
    emergencyContact: emergency
      ? { name: emergency.name, relationship: emergency.relationship, phone: emergency.phone }
      : null,
    prescriptionHistory: prescriptions.map((r) => ({
      id: r.id,
      medicationName: r.medication_name,
      dosage: r.dosage,
      prescriber: r.prescriber,
      datePrescribed: r.date_prescribed?.toISOString().slice(0, 10),
      duration: r.duration,
      condition: r.condition,
      pharmacy: r.pharmacy,
      status: r.status,
    })),
  };
}

module.exports = router;
module.exports.assemblePatientProfile = assemblePatientProfile;
