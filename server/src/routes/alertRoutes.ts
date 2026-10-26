import { Router } from 'express';
import { AlertController } from '../controllers/alertController';

const router = Router();

router.get('/', AlertController.getAllAlerts);
router.post('/', AlertController.createAlert);
router.patch('/:id/resolve', AlertController.resolveAlert);

export default router;
