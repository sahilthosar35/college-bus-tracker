import React, { FormEvent, useEffect, useState } from 'react';
import { Bus, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { AuthUser } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void;
}

interface RegistrationBus {
  id: string;
  busNumber: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [assignedBusId, setAssignedBusId] = useState('');
  const [buses, setBuses] = useState<RegistrationBus[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isRegistering) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/auth/registration-buses`, { credentials: 'include' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load buses.');
        if (!cancelled) {
          setBuses(result.data as RegistrationBus[]);
          setAssignedBusId(current => current || result.data[0]?.id || '');
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Unable to load buses.');
      });

    return () => {
      cancelled = true;
    };
  }, [isRegistering]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isRegistering ? { name, assignedBusId } : {}),
          email,
          password
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Authentication failed.');
      onAuthenticated(result.data.user as AuthUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to the account service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-950">
      <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6">
          <Bus className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white">
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {isRegistering
            ? 'Register as a student or parent to follow your assigned bus.'
            : 'Sign in to open your role-specific transport dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-7">
          {isRegistering && (
            <label className="block">
              <span className="text-xs font-semibold text-slate-300">Full name</span>
              <span className="relative block mt-1.5">
                <UserRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={event => setName(event.target.value)}
                  autoComplete="name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Your name"
                />
              </span>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Email address</span>
            <span className="relative block mt-1.5">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                required
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-blue-500"
                placeholder="you@example.com"
              />
            </span>
          </label>

          {isRegistering && (
            <label className="block">
              <span className="text-xs font-semibold text-slate-300">Assigned bus</span>
              <select
                required
                value={assignedBusId}
                onChange={event => setAssignedBusId(event.target.value)}
                className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              >
                {buses.length === 0 && <option value="">No buses available</option>}
                {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber}</option>)}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Password</span>
            <span className="relative block mt-1.5">
              <LockKeyhole className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={isRegistering ? 12 : undefined}
                maxLength={128}
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-11 text-sm text-white outline-none focus:border-blue-500"
                placeholder={isRegistering ? 'At least 12 characters' : 'Your password'}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(value => !value)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (isRegistering && buses.length === 0)}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 text-sm font-bold text-white transition"
          >
            {isSubmitting ? 'Please wait…' : isRegistering ? 'Create student / parent account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {isRegistering ? 'Already have an account?' : 'New student or parent?'}{' '}
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsRegistering(value => !value);
            }}
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        <p className="text-[11px] leading-relaxed text-slate-500 mt-5 text-center">
          Driver and administrator accounts are issued by the transport administrator.
        </p>
      </section>
    </main>
  );
};
