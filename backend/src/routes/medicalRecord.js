import { Router } from 'express';
import pool, { findById, dbError } from '../config/database.js';

const router = Router();

const JOINED = `SELECT m.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
  d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
  FROM medical_record m
  JOIN patient p ON m.patient_id = p.patient_id
  JOIN doctor d ON m.doctor_id = d.doctor_id`;

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`${JOINED} ORDER BY m.record_date DESC`);
    res.json(result.rows);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await findById('medical_record', 'record_id', req.params.id);
    if (!row) return res.status(404).json({ error: 'Medical record not found' });
    res.json(row);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_id, diagnosis, prescription, notes } = req.body;
    if (!patient_id || !doctor_id || !diagnosis)
      return res.status(400).json({ error: 'patient_id, doctor_id and diagnosis are required.' });
    const result = await pool.query(
      'INSERT INTO medical_record (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, appointment_id || null, diagnosis, prescription || null, notes || null]);
    res.status(201).json(await findById('medical_record', 'record_id', result.insertId));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, appointment_id, diagnosis, prescription, notes } = req.body;
    if (!(await findById('medical_record', 'record_id', id))) return res.status(404).json({ error: 'Medical record not found' });
    await pool.query(
      'UPDATE medical_record SET patient_id = ?, doctor_id = ?, appointment_id = ?, diagnosis = ?, prescription = ?, notes = ? WHERE record_id = ?',
      [patient_id, doctor_id, appointment_id || null, diagnosis, prescription || null, notes || null, id]);
    res.json(await findById('medical_record', 'record_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await findById('medical_record', 'record_id', id))) return res.status(404).json({ error: 'Medical record not found' });
    await pool.query('DELETE FROM medical_record WHERE record_id = ?', [id]);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
