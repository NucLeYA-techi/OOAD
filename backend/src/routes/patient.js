import { Router } from 'express';
import pool, { findById, dbError } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patient ORDER BY patient_id');
    res.json(result.rows);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await findById('patient', 'patient_id', req.params.id);
    if (!row) return res.status(404).json({ error: 'Patient not found' });
    res.json(row);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, phone, email, address, blood_group } = req.body;
    if (!first_name || !last_name || !date_of_birth || !gender || !phone || !address)
      return res.status(400).json({ error: 'first_name, last_name, date_of_birth, gender, phone and address are required.' });
    const result = await pool.query(
      'INSERT INTO patient (first_name, last_name, date_of_birth, gender, phone, email, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, date_of_birth, gender, phone, email || null, address, blood_group || null]);
    res.status(201).json(await findById('patient', 'patient_id', result.insertId));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, gender, phone, email, address, blood_group } = req.body;
    if (!(await findById('patient', 'patient_id', id))) return res.status(404).json({ error: 'Patient not found' });
    await pool.query(
      'UPDATE patient SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ? WHERE patient_id = ?',
      [first_name, last_name, date_of_birth, gender, phone, email || null, address, blood_group || null, id]);
    res.json(await findById('patient', 'patient_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await findById('patient', 'patient_id', id))) return res.status(404).json({ error: 'Patient not found' });
    await pool.query('DELETE FROM patient WHERE patient_id = ?', [id]);
    res.json({ message: 'Patient deleted successfully (appointments & records cascaded)' });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
