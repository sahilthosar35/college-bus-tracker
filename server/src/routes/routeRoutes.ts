import { Router } from 'express';
import { RouteController } from '../controllers/routeController';

const router = Router();

router.get('/', RouteController.getAllRoutes);
router.get('/:id', RouteController.getRouteById);
router.get('/:id/stops', RouteController.getRouteStops);

export default router;
