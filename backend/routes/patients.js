/**
 * ZuriCare API - Patient profile (for app sync)
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { assemblePatientProfile } = require('./auth');

// Get patient profile by ZuriCare ID (for app after login)
router.get('/profile/:zuriCareId', async (req, res) => {
  try {
    const id = req.params.zuriCareId.trim().toUpperCase();
    const patient = await db.queryOne('SELECT id FROM patients WHERE zuri_care_id = ?', [id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const profile = await assemblePatientProfile(patient.id);
    res.json(profile);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
