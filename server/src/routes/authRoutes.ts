import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, requireMongo, requireRole, verifyOrigin } from '../middleware/auth';

const router = Router();

router.get('/registration-buses', requireMongo, AuthController.listRegistrationBuses);
router.post('/register', requireMongo, verifyOrigin, AuthController.register);
router.post('/login', requireMongo, verifyOrigin, AuthController.login);
router.post('/logout', verifyOrigin, AuthController.logout);
router.get('/me', authenticate, AuthController.currentUser);
router.post('/password', requireMongo, verifyOrigin, authenticate, AuthController.changePassword);
router.get('/users', requireMongo, authenticate, requireRole('admin'), AuthController.listUsers);
router.post('/users', requireMongo, verifyOrigin, authenticate, requireRole('admin'), AuthController.createUser);

export default router;
