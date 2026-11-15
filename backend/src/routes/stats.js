import { Router } from 'express';
import pool, { dbError } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const tables = ['department', 'doctor', 'patient', 'appointment', 'medical_record'];
    const counts = {};
    for (const t of tables) {
      const r = await pool.query(`SELECT COUNT(*) AS c FROM ${t}`);
      counts[t] = r.rows[0].c;
    }
    const upcoming = await pool.query(
      `SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status,
              p.first_name AS patient, d.first_name AS doctor, d.specialization
       FROM appointment a JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor d ON a.doctor_id = d.doctor_id
       WHERE a.status = 'Scheduled' ORDER BY a.appointment_date, a.appointment_time LIMIT 10`);
    res.json({ counts, upcoming: upcoming.rows });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
