/**
 * Seed demo patient (ZC-DEMO-NKOSBONA) for testing
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config');

const DEMO_ID = 'ZC-DEMO-NKOSBONA';
const DEMO_PIN = '1234';
const PATIENT_UUID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

async function run() {
  const conn = await mysql.createConnection(config.db);
  try {
    const pinHash = await bcrypt.hash(DEMO_PIN, 10);
    await conn.execute(
      `INSERT INTO patients (id, zuri_care_id, full_name, date_of_birth, nationality, phone, email, pin_hash, language_preference)
       VALUES (?, ?, 'Demo Patient', '1990-01-15', 'South Africa', '+27123456789', 'demo@zuricare.org', ?, 'en')
       ON DUPLICATE KEY UPDATE pin_hash = VALUES(pin_hash), full_name = VALUES(full_name)`,
      [PATIENT_UUID, DEMO_ID, pinHash]
    );
    const [rows] = await conn.execute('SELECT id FROM patient_health_profiles WHERE patient_id = ?', [PATIENT_UUID]);
    if (!rows.length) {
      await conn.execute(
        `INSERT INTO patient_health_profiles (id, patient_id, blood_type) VALUES (UUID(), ?, 'O+')`,
        [PATIENT_UUID]
      );
    }
    console.log(`Demo patient ${DEMO_ID} ready. PIN: ${DEMO_PIN}`);
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
