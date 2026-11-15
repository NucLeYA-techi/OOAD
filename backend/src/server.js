import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import departmentRouter from './routes/department.js';
import doctorRouter from './routes/doctor.js';
import patientRouter from './routes/patient.js';
import appointmentRouter from './routes/appointment.js';
import medicalRecordRouter from './routes/medicalRecord.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'hms-backend-js' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.use('/api/departments', departmentRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/medical-records', medicalRecordRouter);
app.use('/api/stats', statsRouter);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

app.listen(PORT, () => console.log(`HMS backend (JS) running on http://localhost:${PORT}`));
