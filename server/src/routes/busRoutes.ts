import { Router } from 'express';
import { BusController } from '../controllers/busController';

const router = Router();

router.get('/', BusController.getAllBuses);
router.get('/:id', BusController.getBusById);
router.get('/:id/etas', BusController.getBusETAs);
router.patch('/:id/status', BusController.updateStatus);

export default router;
