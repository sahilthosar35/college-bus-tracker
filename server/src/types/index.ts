export type AppRole = 'student' | 'driver' | 'admin';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  assignedBusId?: string;
}
