/**
 * HTTP adapter for /api/stats — delegates to HospitalService.
 */
import { Router, type Request, type Response } from 'express';
import { getHospitalService } from '../services.js';
import { toErrorResponse } from '../errors.js';

const router = Router();
const service = getHospitalService();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await service.stats());
  } catch (err) {
    const e = toErrorResponse(err as Error);
    res.status(e.status).json({ error: e.error });
  }
});

export default router;
