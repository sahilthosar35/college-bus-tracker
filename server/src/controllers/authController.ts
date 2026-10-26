import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { BusRepository } from '../models/Bus';
import {
  createSessionToken,
  hashPassword,
  publicUser,
  SESSION_COOKIE_NAME,
  verifyPassword
} from '../services/authService';
import { AppRole } from '../types';

const PASSWORD_MIN_LENGTH = 12;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  path: '/',
  maxAge: 12 * 60 * 60 * 1000
});

const setSessionCookie = (res: Response, token: string): void => {
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
};

const normalizeEmail = (email: unknown): string =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const validCredentials = (name: unknown, email: string, password: unknown): string | null => {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return 'Name must be between 2 and 100 characters.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
    return `Password must be between ${PASSWORD_MIN_LENGTH} and 128 characters.`;
  }
  return null;
};

export class AuthController {
  public static async changePassword(req: Request, res: Response): Promise<void> {
    const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = req.body.newPassword;
    if (typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > 128) {
      res.status(400).json({
        success: false,
        message: `New password must be between ${PASSWORD_MIN_LENGTH} and 128 characters.`
      });
      return;
    }

    try {
      const user = await UserModel.findById(req.user?.id).select('+passwordHash');
      if (!user) {
        res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
        return;
      }
      if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        return;
      }

      user.passwordHash = await hashPassword(newPassword);
      await user.save();
      setSessionCookie(res, createSessionToken(user));
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
      console.error('[Auth] Password update failed:', error);
      res.status(500).json({ success: false, message: 'Unable to update your password.' });
    }
  }

  public static async listRegistrationBuses(_req: Request, res: Response): Promise<void> {
    try {
      const buses = await BusRepository.getAll();
      res.json({
        success: true,
        data: buses.map(bus => ({ id: bus.id, busNumber: bus.busNumber }))
      });
    } catch (error) {
      console.error('[Auth] Available bus lookup failed:', error);
      res.status(500).json({ success: false, message: 'Unable to load available buses.' });
    }
  }

  public static async register(req: Request, res: Response): Promise<void> {
    const email = normalizeEmail(req.body.email);
    const validationError = validCredentials(req.body.name, email, req.body.password);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }

    const assignedBusId = typeof req.body.assignedBusId === 'string'
      ? req.body.assignedBusId.trim()
      : '';
    if (!assignedBusId) {
      res.status(400).json({ success: false, message: 'Choose a valid assigned bus.' });
      return;
    }

    try {
      if (!(await BusRepository.getById(assignedBusId))) {
        res.status(400).json({ success: false, message: 'Choose a valid assigned bus.' });
        return;
      }
      const user = await UserModel.create({
        name: req.body.name.trim(),
        email,
        passwordHash: await hashPassword(req.body.password),
        role: 'student',
        assignedBusId
      });
      setSessionCookie(res, createSessionToken(user));
      res.status(201).json({ success: true, data: { user: publicUser(user) } });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }
      console.error('[Auth] Student registration failed:', error);
      res.status(500).json({ success: false, message: 'Unable to create your account.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password || password.length > 128) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    try {
      const user = await UserModel.findOne({ email }).select('+passwordHash');
      const isValid = user
        ? await verifyPassword(password, user.passwordHash)
        : await verifyPassword(password, `${'0'.repeat(32)}:${'0'.repeat(128)}`);
      if (!user || !isValid) {
        res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
        return;
      }

      setSessionCookie(res, createSessionToken(user));
      res.json({ success: true, data: { user: publicUser(user) } });
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      res.status(500).json({ success: false, message: 'Unable to sign in right now.' });
    }
  }

  public static async currentUser(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: { user: req.user } });
  }

  public static logout(_req: Request, res: Response): void {
    res.clearCookie(SESSION_COOKIE_NAME, {
      ...cookieOptions(),
      maxAge: undefined
    });
    res.json({ success: true });
  }

  public static async listUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.find()
        .select('name email role assignedBusId createdAt')
        .sort({ createdAt: -1 })
        .lean();
      res.json({
        success: true,
        data: users.map(user => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          assignedBusId: user.assignedBusId,
          createdAt: user.createdAt
        }))
      });
    } catch (error) {
      console.error('[Auth] User listing failed:', error);
      res.status(500).json({ success: false, message: 'Unable to load accounts.' });
    }
  }

  public static async createUser(req: Request, res: Response): Promise<void> {
    const email = normalizeEmail(req.body.email);
    const role = req.body.role as AppRole;
    const validationError = validCredentials(req.body.name, email, req.body.password);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }
    if (!['student', 'driver', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Choose a valid account role.' });
      return;
    }

    const assignedBusId = typeof req.body.assignedBusId === 'string'
      ? req.body.assignedBusId.trim()
      : '';
    if (role !== 'admin' && !assignedBusId) {
      res.status(400).json({ success: false, message: 'Choose a valid assigned bus.' });
      return;
    }

    try {
      if (role !== 'admin' && !(await BusRepository.getById(assignedBusId))) {
        res.status(400).json({ success: false, message: 'Choose a valid assigned bus.' });
        return;
      }
      const user = await UserModel.create({
        name: req.body.name.trim(),
        email,
        passwordHash: await hashPassword(req.body.password),
        role,
        assignedBusId: role === 'admin' ? undefined : assignedBusId
      });
      res.status(201).json({ success: true, data: { user: publicUser(user) } });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }
      console.error('[Auth] Account provisioning failed:', error);
      res.status(500).json({ success: false, message: 'Unable to create this account.' });
    }
  }
}
