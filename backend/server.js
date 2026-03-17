/**
 * ZuriCare Backend API
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const auditRoutes = require('./routes/audit');
const screeningRoutes = require('./routes/screenings');
const consentRoutes = require('./routes/consent');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/consent', consentRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`ZuriCare API running on http://localhost:${PORT}`);
});
