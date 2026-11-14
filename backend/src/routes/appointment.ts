/**
 * HTTP adapter for /api/appointments — thin: delegates to HospitalService.
 */
import { Router, type Request, type Response } from 'express';
import { getHospitalService } from '../services.js';
import { toErrorResponse } from '../errors.js';
import type { AppointmentStatusValue } from '../models/index.js';

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

router.get('/', handle(() => service.listAppointments()));
router.get('/:id', handle((req) => service.getAppointment(req.params.id)));
router.post('/', handle((req) => service.createAppointment(req.body as Record<string, unknown>), 201));
router.put('/:id', handle((req) => service.updateAppointment(req.params.id, req.body as Record<string, unknown>)));
router.patch(
  '/:id/status',
  handle((req) => service.setAppointmentStatus(req.params.id, req.body.status as AppointmentStatusValue)),
);
router.delete('/:id', handle((req) => service.deleteAppointment(req.params.id)));

export default router;
