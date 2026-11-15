import { Router } from 'express';
import pool, { findById, dbError } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, dep.department_name FROM doctor d
       JOIN department dep ON d.department_id = dep.department_id
       ORDER BY d.doctor_id`);
    res.json(result.rows);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await findById('doctor', 'doctor_id', req.params.id);
    if (!row) return res.status(404).json({ error: 'Doctor not found' });
    res.json(row);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, specialization, phone, email, consultation_fee, department_id } = req.body;
    if (!first_name || !last_name || !specialization || !phone || !email || department_id == null)
      return res.status(400).json({ error: 'first_name, last_name, specialization, phone, email and department_id are required.' });
    const result = await pool.query(
      'INSERT INTO doctor (first_name, last_name, specialization, phone, email, consultation_fee, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, specialization, phone, email, consultation_fee ?? 0, department_id]);
    res.status(201).json(await findById('doctor', 'doctor_id', result.insertId));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, specialization, phone, email, consultation_fee, department_id } = req.body;
    if (!(await findById('doctor', 'doctor_id', id))) return res.status(404).json({ error: 'Doctor not found' });
    await pool.query(
      'UPDATE doctor SET first_name = ?, last_name = ?, specialization = ?, phone = ?, email = ?, consultation_fee = ?, department_id = ? WHERE doctor_id = ?',
      [first_name, last_name, specialization, phone, email, consultation_fee ?? 0, department_id, id]);
    res.json(await findById('doctor', 'doctor_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await findById('doctor', 'doctor_id', id))) return res.status(404).json({ error: 'Doctor not found' });
    await pool.query('DELETE FROM doctor WHERE doctor_id = ?', [id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
