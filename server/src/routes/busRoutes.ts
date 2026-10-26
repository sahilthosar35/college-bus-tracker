import { Router } from 'express';
import { BusController } from '../controllers/busController';
import { authenticate, requireAssignedBus, requireRole, verifyOrigin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', BusController.getAllBuses);
router.get('/:id', requireAssignedBus, BusController.getBusById);
router.get('/:id/etas', requireAssignedBus, BusController.getBusETAs);
router.patch('/:id/status', verifyOrigin, requireRole('admin', 'driver'), requireAssignedBus, BusController.updateStatus);

export default router;
