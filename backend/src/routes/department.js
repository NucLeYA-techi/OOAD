import { Router } from 'express';
import pool, { findById, dbError } from '../config/database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM department ORDER BY department_id');
    res.json(result.rows);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await findById('department', 'department_id', req.params.id);
    if (!row) return res.status(404).json({ error: 'Department not found' });
    res.json(row);
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.post('/', async (req, res) => {
  try {
    const { department_name, location, phone } = req.body;
    if (!department_name || !location || !phone) return res.status(400).json({ error: 'department_name, location and phone are required.' });
    const result = await pool.query(
      'INSERT INTO department (department_name, location, phone) VALUES (?, ?, ?)',
      [department_name, location, phone],
    );
    res.status(201).json(await findById('department', 'department_id', result.insertId));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { department_name, location, phone } = req.body;
    const { id } = req.params;
    if (!(await findById('department', 'department_id', id))) return res.status(404).json({ error: 'Department not found' });
    await pool.query('UPDATE department SET department_name = ?, location = ?, phone = ? WHERE department_id = ?',
      [department_name, location, phone, id]);
    res.json(await findById('department', 'department_id', id));
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await findById('department', 'department_id', id))) return res.status(404).json({ error: 'Department not found' });
    await pool.query('DELETE FROM department WHERE department_id = ?', [id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) { const e = dbError(err); res.status(e.status).json({ error: e.error }); }
});

export default router;
