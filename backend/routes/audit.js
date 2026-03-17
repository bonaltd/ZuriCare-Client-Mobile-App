/**
 * ZuriCare API - Audit logs
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get audit logs for a patient (by ZuriCare ID)
router.get('/', async (req, res) => {
  try {
    const { patientId, zuriCareId } = req.query;
    let pid = patientId;
    if (!pid && zuriCareId) {
      const p = await db.queryOne('SELECT id FROM patients WHERE zuri_care_id = ?', [zuriCareId.trim().toUpperCase()]);
      pid = p?.id;
    }
    if (!pid) {
      return res.status(400).json({ error: 'patientId or zuriCareId required' });
    }
    const logs = await db.query(
      `SELECT id, actor_type, actor_id, patient_id, action, entity_type, entity_id, details, created_at as timestamp
       FROM audit_logs WHERE patient_id = ? ORDER BY created_at DESC LIMIT 100`,
      [pid]
    );
    res.json(logs.map((l) => ({ ...l, timestamp: l.timestamp?.toISOString?.() || l.timestamp })));
  } catch (err) {
    console.error('Audit list error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Add audit log (from patient app)
router.post('/', async (req, res) => {
  try {
    const { patientId, zuriCareId, type, requester, action, consented, scopes } = req.body;
    let pid = patientId;
    if (!pid && zuriCareId) {
      const p = await db.queryOne('SELECT id FROM patients WHERE zuri_care_id = ?', [zuriCareId.trim().toUpperCase()]);
      pid = p?.id;
    }
    if (!pid) {
      return res.status(400).json({ error: 'Patient not found' });
    }
    const id = db.uuid();
    await db.query(
      `INSERT INTO audit_logs (id, actor_type, actor_id, patient_id, action, entity_type, details, created_at)
       VALUES (?, 'patient', ?, ?, ?, 'consent', ?, NOW())`,
      [
        id,
        pid,
        pid,
        action || 'access_request',
        JSON.stringify({ type, requester, consented, scopes }),
      ]
    );
    res.json({ success: true, id });
  } catch (err) {
    console.error('Audit add error:', err);
    res.status(500).json({ error: 'Failed to add audit log' });
  }
});

module.exports = router;
