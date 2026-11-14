/**
 * server.ts — Entry point: mounts the route adapters on an Express app.
 * All business logic lives in HospitalService; this file only wires layers.
 */
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseManager } from './config/database.js';
import departmentRouter from './routes/department.js';
import doctorRouter from './routes/doctor.js';
import patientRouter from './routes/patient.js';
import appointmentRouter from './routes/appointment.js';
import medicalRecordRouter from './routes/medicalRecord.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    await DatabaseManager.instance().query('SELECT 1');
    res.json({ status: 'ok', service: 'hms-backend' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: (err as Error).message });
  }
});

app.use('/api/departments', departmentRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/medical-records', medicalRecordRouter);
app.use('/api/stats', statsRouter);

app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`HMS backend running on http://localhost:${PORT}`);
});
