import React, { useState } from 'react';
import { X, ShieldAlert, PhoneCall, AlertTriangle, CheckCircle, BellRing } from 'lucide-react';
import { Bus } from '../../types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBus: Bus | null;
  onDispatchSOS: (message: string) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  activeBus,
  onDispatchSOS
}) => {
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [sosReason, setSosReason] = useState<string>('Medical Emergency / Physical Safety Alert');

  if (!isOpen) return null;

  const handleSendSOS = () => {
    onDispatchSOS(sosReason);
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-red-600/40 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-950/50 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Assistance Hub</h3>
              <p className="text-xs text-red-400 font-medium">Campus Safety & Transport Hotline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Confirmation state */}
        {sosSent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white">SOS Broadcast Dispatched!</h4>
            <p className="text-sm text-slate-300">
              Campus Security, Transport Coordinator, and College Admins have been notified with current GPS coordinates.
            </p>
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300 font-semibold">
              Live siren broadcast active across Admin Console.
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            
            {/* Bus Info if selected */}
            {activeBus && (
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Monitored Bus:</span>
                  <span className="text-white font-bold">{activeBus.busNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Driver:</span>
                  <span className="text-amber-400 font-semibold">{activeBus.driverName}</span>
                </div>
              </div>
            )}

            {/* Quick Emergency Phone Hotlines */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Instant Telephone Hotlines
              </label>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="tel:+917122667400"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-blue-300">JIT Campus Security Gate #1</p>
                      <p className="text-[11px] text-slate-400">+91 712 266 7400 (Control Room)</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-900">
                    Call Now
                  </span>
                </a>

                <a
                  href="tel:+919822145012"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300">College Transport Coordinator</p>
                      <p className="text-[11px] text-slate-400">+91 98221 45012 (Fleet Head)</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-900">
                    Call Now
                  </span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center block transition"
                  >
                    <span className="text-[11px] text-slate-400 block">Police Emergency</span>
                    <span className="text-sm font-black text-red-400">112</span>
                  </a>
                  <a
                    href="tel:1090"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center block transition"
                  >
                    <span className="text-[11px] text-slate-400 block">Women Safety Helpline</span>
                    <span className="text-sm font-black text-pink-400">1090</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Broadcast SOS Section */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Broadcast Digital SOS to Fleet Admins
              </label>
              <select
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="Medical Emergency / Physical Safety Alert">Medical Emergency / Physical Safety Alert</option>
                <option value="Vehicle Mechanical Breakdown on Highway">Vehicle Mechanical Breakdown on Highway</option>
                <option value="Accident / Road Collision Incident">Accident / Road Collision Incident</option>
                <option value="Unsafe Conditions / Harassment Alert">Unsafe Conditions / Harassment Alert</option>
              </select>

              <button
                onClick={handleSendSOS}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-red-600/40 flex items-center justify-center space-x-2 transition transform active:scale-95"
              >
                <BellRing className="w-5 h-5 animate-bounce" />
                <span>DISPATCH EMERGENCY SOS ALERT</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
