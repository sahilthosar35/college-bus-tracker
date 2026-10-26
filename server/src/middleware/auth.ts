import { NextFunction, Request, Response } from 'express';
import { isMongoConnected } from '../config/db';
import { config } from '../config/config';
import { BusRepository } from '../models/Bus';
import { SESSION_COOKIE_NAME, readSessionToken } from '../services/authService';
import { AppRole, AuthenticatedUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireMongo = (_req: Request, res: Response, next: NextFunction): void => {
  if (!isMongoConnected) {
    res.status(503).json({ success: false, message: 'Account services require a MongoDB connection.' });
    return;
  }
  next();
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(SESSION_COOKIE_NAME.length + 1);
  const user = token ? readSessionToken(token) : null;
  if (!user) {
    res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    return;
  }
  req.user = user;
  next();
};

export const requireRole = (...roles: AppRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
      return;
    }
    next();
  };

export const requireAssignedBus = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    return;
  }
  if (req.user.role !== 'admin' && req.user.assignedBusId !== req.params.id) {
    res.status(403).json({ success: false, message: 'This vehicle is not assigned to your account.' });
    return;
  }
  next();
};

export const verifyOrigin = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.get('Origin');
  const allowedOrigins = config.clientUrl.split(',').map(value => value.trim());
  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
    return;
  }
  next();
};

export const requireAssignedRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || req.user.role === 'admin') {
    next();
    return;
  }
  try {
    const bus = req.user.assignedBusId
      ? await BusRepository.getById(req.user.assignedBusId)
      : null;
    if (!bus || bus.routeId !== req.params.id) {
      res.status(403).json({ success: false, message: 'This route is not assigned to your account.' });
      return;
    }
    next();
  } catch (error) {
    console.error('[Auth] Assigned route check failed:', error);
    res.status(500).json({ success: false, message: 'Unable to verify route access.' });
  }
};
