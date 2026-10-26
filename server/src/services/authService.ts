import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'crypto';
import { promisify } from 'util';
import { config } from '../config/config';
import { AppRole, AuthenticatedUser } from '../types';
import { IUserDocument } from '../models/User';

const scrypt = promisify(scryptCallback);
const SESSION_TTL_SECONDS = 60 * 60 * 12;
export const SESSION_COOKIE_NAME = 'bus_tracker_session';

interface SessionPayload extends AuthenticatedUser {
  exp: number;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false;

  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const encode = (value: string): string => Buffer.from(value).toString('base64url');

export const createSessionToken = (user: IUserDocument): string => {
  const payload: SessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    assignedBusId: user.assignedBusId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const body = encode(JSON.stringify(payload));
  const signature = createHmac('sha256', config.authSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

export const readSessionToken = (token: string): SessionPayload | null => {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = createHmac('sha256', config.authSecret).update(body).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (
      !payload.id ||
      !payload.email ||
      !['student', 'driver', 'admin'].includes(payload.role as AppRole) ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const publicUser = (user: IUserDocument): AuthenticatedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  assignedBusId: user.assignedBusId
});
