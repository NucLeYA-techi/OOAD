import { Router } from 'express';
import pool, { findById, dbError } from '../config/database.js';

const router = Router();

const JOINED = `SELECT a.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
  d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
  FROM appointment a
  JOIN patient p ON a.patient_id = p.patient_id
  JOIN doctor d ON a.doctor_id = d.doctor_id`;

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`${JOINED} ORDER BY a.appointment_date DESC, a.appointment_time DESC`);
    res.json(result.rows);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`${JOINED} WHERE a.appointment_id = ?`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status, reason } = req.body;
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time)
      return res.status(400).json({ error: 'patient_id, doctor_id, appointment_date and appointment_time are required.' });
    const result = await pool.query(
      'INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_date, appointment_time, status || 'Scheduled', reason || null]);
    res.status(201).json(await findById('appointment', 'appointment_id', result.insertId));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, appointment_date, appointment_time, status, reason } = req.body;
    if (!(await findById('appointment', 'appointment_id', id))) return res.status(404).json({ error: 'Appointment not found' });
    await pool.query(
      'UPDATE appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, status = ?, reason = ? WHERE appointment_id = ?',
      [patient_id, doctor_id, appointment_date, appointment_time, status, reason, id]);
    res.json(await findById('appointment', 'appointment_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status))
      return res.status(400).json({ error: 'status must be Scheduled, Completed or Cancelled.' });
    if (!(await findById('appointment', 'appointment_id', id))) return res.status(404).json({ error: 'Appointment not found' });
    await pool.query('UPDATE appointment SET status = ? WHERE appointment_id = ?', [status, id]);
    res.json(await findById('appointment', 'appointment_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await findById('appointment', 'appointment_id', id))) return res.status(404).json({ error: 'Appointment not found' });
    await pool.query('DELETE FROM appointment WHERE appointment_id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
