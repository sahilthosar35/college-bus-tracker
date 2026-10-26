import React, { FormEvent, useEffect, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { AppRole, Bus } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  assignedBusId?: string;
}

interface AccountManagementProps {
  buses: Bus[];
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ buses }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppRole>('driver');
  const [assignedBusId, setAssignedBusId] = useState(buses[0]?.id || '');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, { credentials: 'include' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to load accounts.');
    setUsers(result.data as ManagedUser[]);
  };

  useEffect(() => {
    loadUsers().catch(error => {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to load accounts.');
    });
  }, []);

  useEffect(() => {
    if (role !== 'admin' && !buses.some(bus => bus.id === assignedBusId)) {
      setAssignedBusId(buses[0]?.id || '');
    }
  }, [assignedBusId, buses, role]);

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(role === 'admin' ? {} : { assignedBusId })
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to create account.');
      setName('');
      setEmail('');
      setPassword('');
      await loadUsers();
      setIsError(false);
      setMessage('Account created. Share the temporary password securely with the user.');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Users className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">User accounts</h3>
        <span className="ml-auto text-xs text-slate-400">{users.length} accounts</span>
      </div>

      <form onSubmit={createAccount} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Full name"
          className="lg:col-span-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <input
          required
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          className="lg:col-span-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <input
          required
          type="password"
          minLength={12}
          maxLength={128}
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="Temporary password (12+ chars)"
          className="lg:col-span-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <select
          value={role}
          onChange={event => setRole(event.target.value as AppRole)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="driver">Driver</option>
          <option value="student">Student / Parent</option>
          <option value="admin">Administrator</option>
        </select>
        {role !== 'admin' && (
          <select
            required
            value={assignedBusId}
            onChange={event => setAssignedBusId(event.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber}</option>)}
          </select>
        )}
        <button
          type="submit"
          disabled={isSubmitting || (role !== 'admin' && buses.length === 0)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg px-3 py-2 text-sm font-bold text-white"
        >
          <UserPlus className="w-4 h-4" />
          Create account
        </button>
      </form>

      {message && (
        <p role="status" className={`text-sm ${isError ? 'text-red-300' : 'text-emerald-300'}`}>{message}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="uppercase text-[10px] text-slate-500">
            <tr>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2">Assigned bus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 pr-3 font-medium text-white">{user.name}</td>
                <td className="py-2 pr-3">{user.email}</td>
                <td className="py-2 pr-3 capitalize">{user.role === 'student' ? 'Student / Parent' : user.role}</td>
                <td className="py-2">
                  {user.assignedBusId
                    ? buses.find(bus => bus.id === user.assignedBusId)?.busNumber || user.assignedBusId
                    : 'All fleet access'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
