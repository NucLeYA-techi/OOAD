/**
 * HTTP adapter for /api/medical-records — thin: delegates to HospitalService.
 */
import { Router, type Request, type Response } from 'express';
import { getHospitalService } from '../services.js';
import { toErrorResponse } from '../errors.js';

const router = Router();
const service = getHospitalService();

type RouteFn = (req: Request) => Promise<unknown>;
const handle =
  (fn: RouteFn, status: number = 200) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(status).json(await fn(req));
    } catch (err) {
      const e = toErrorResponse(err as Error);
      res.status(e.status).json({ error: e.error });
    }
  };

router.get('/', handle(() => service.listMedicalRecords()));
router.get('/:id', handle((req) => service.getMedicalRecord(req.params.id)));
router.post('/', handle((req) => service.createMedicalRecord(req.body as Record<string, unknown>), 201));
router.put('/:id', handle((req) => service.updateMedicalRecord(req.params.id, req.body as Record<string, unknown>)));
router.delete('/:id', handle((req) => service.deleteMedicalRecord(req.params.id)));

export default router;
