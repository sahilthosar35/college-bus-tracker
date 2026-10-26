import { Router } from 'express';
import { AlertController } from '../controllers/alertController';
import { authenticate, requireRole, verifyOrigin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', AlertController.getAllAlerts);
router.post('/', verifyOrigin, requireRole('student', 'driver', 'admin'), AlertController.createAlert);
router.patch('/:id/resolve', verifyOrigin, requireRole('admin'), AlertController.resolveAlert);

export default router;
