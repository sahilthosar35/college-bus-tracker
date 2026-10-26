import React from 'react';
import { AuthUser } from '../../types';
import { Bus, ShieldAlert, Info, Radio, LogOut, KeyRound } from 'lucide-react';

interface HeaderProps {
  user: AuthUser;
  onSignOut: () => void;
  onOpenPassword: () => void;
  isConnected: boolean;
  onOpenSOS: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignOut,
  onOpenPassword,
  isConnected,
  onOpenSOS,
  onOpenAbout
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & College Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white border border-blue-400/30">
              <Bus className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                  JIT Smart Bus-Tracker
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800">
                  Group G6 • CSE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate max-w-sm">
                Jhulelal Institute of Technology, Nagpur (RTMNU 2026–27)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                {user.role === 'student' ? 'Student / Parent' : user.role}
              </p>
            </div>
            <button
              onClick={onOpenPassword}
              title="Change password"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Action Tools: Live Socket Status, Emergency SOS, About */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Socket Status Pill */}
            <div
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              <span>{isConnected ? 'Telemetry Live' : 'Demo Mode'}</span>
            </div>

            {/* About / Guide Modal Button */}
            <button
              onClick={onOpenAbout}
              title="About Project, Guide & Group G6 Details"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center space-x-1 transition"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">About Project</span>
            </button>

            {/* High-Visibility Emergency SOS Button */}
            <button
              onClick={onOpenSOS}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-red-600/30 animate-pulse transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
