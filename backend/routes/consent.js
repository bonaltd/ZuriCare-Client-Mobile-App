/**
 * ZuriCare API - Consent requests (patient app)
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get pending consent requests for a patient
router.get('/requests', async (req, res) => {
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
      `SELECT cr.id, cr.patient_id, cr.requester_id, cr.clinic_id, cr.scopes_requested, cr.reason, cr.created_at,
              cs.full_name AS requester_name, c.name AS clinic_name
       FROM consent_requests cr
       JOIN clinic_staff cs ON cr.requester_id = cs.id
       JOIN clinics c ON cr.clinic_id = c.id
       WHERE cr.patient_id = ? AND cr.status = 'pending'
       ORDER BY cr.created_at DESC`,
      [pid]
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        requesterName: r.requester_name,
        clinicName: r.clinic_name,
        scopesRequested: r.scopes_requested,
        reason: r.reason,
        createdAt: r.created_at?.toISOString?.() || r.created_at,
      }))
    );
  } catch (err) {
    console.error('Consent list error:', err);
    res.status(500).json({ error: 'Failed to fetch consent requests' });
  }
});

// Respond to consent request (grant or deny)
router.post('/requests/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { granted, scopesGranted } = req.body;
    const request = await db.queryOne('SELECT * FROM consent_requests WHERE id = ? AND status = ?', [id, 'pending']);
    if (!request) {
      return res.status(404).json({ error: 'Consent request not found or already responded' });
    }
    const status = granted ? 'granted' : 'denied';
    const scopes = granted && Array.isArray(scopesGranted) ? scopesGranted : null;
    await db.query(
      `UPDATE consent_requests SET status = ?, scopes_granted = ?, responded_at = NOW() WHERE id = ?`,
      [status, scopes ? JSON.stringify(scopes) : null, id]
    );
    res.json({ success: true, status });
  } catch (err) {
    console.error('Consent respond error:', err);
    res.status(500).json({ error: 'Failed to respond to consent' });
  }
});

module.exports = router;
