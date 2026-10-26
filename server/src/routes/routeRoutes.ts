import { Router } from 'express';
import { RouteController } from '../controllers/routeController';
import { authenticate, requireAssignedRoute } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', RouteController.getAllRoutes);
router.get('/:id', requireAssignedRoute, RouteController.getRouteById);
router.get('/:id/stops', requireAssignedRoute, RouteController.getRouteStops);

export default router;
