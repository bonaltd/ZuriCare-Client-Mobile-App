/**
 * ZuriCare API - Screening history
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get screening history for a patient
router.get('/', async (req, res) => {
  try {
    const { patientId, zuriCareId } = req.query;
    let pid = patientId;
    if (!pid && zuriCareId) {
      const p = await db.queryOne('SELECT id FROM patients WHERE zuri_care_id = ?', [zuriCareId.trim().toUpperCase()]);
      pid = p?.id;
    }
    if (!pid) {
      return res.json([]);
    }
    const rows = await db.query(
      `SELECT id, category, symptoms, recommendation, duration, risk_factors_count, timestamp, created_at
       FROM screening_history WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 50`,
      [pid]
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        category: r.category,
        symptoms: r.symptoms,
        recommendation: r.recommendation,
        duration: r.duration,
        riskFactors: r.risk_factors_count,
        timestamp: r.timestamp?.toISOString?.() || r.timestamp,
      }))
    );
  } catch (err) {
    console.error('Screening list error:', err);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
});

// Save screening (from patient app)
router.post('/', async (req, res) => {
  try {
    const { patientId, zuriCareId, category, symptoms, recommendation, duration, riskFactors } = req.body;
    let pid = patientId;
    if (!pid && zuriCareId) {
      const p = await db.queryOne('SELECT id FROM patients WHERE zuri_care_id = ?', [zuriCareId.trim().toUpperCase()]);
      pid = p?.id;
    }
    const id = db.uuid();
    await db.query(
      `INSERT INTO screening_history (id, patient_id, category, symptoms, recommendation, duration, risk_factors_count, timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        pid,
        category || '',
        JSON.stringify(symptoms || []),
        recommendation || '',
        duration || '',
        riskFactors || 0,
      ]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error('Screening save error:', err);
    res.status(500).json({ error: 'Failed to save screening' });
  }
});

module.exports = router;
