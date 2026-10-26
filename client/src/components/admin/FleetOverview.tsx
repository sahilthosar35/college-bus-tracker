import React from 'react';
import { Bus, Alert } from '../../types';
import { Bus as BusIcon, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface FleetOverviewProps {
  buses: Bus[];
  alerts: Alert[];
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ buses, alerts }) => {
  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'EN_ROUTE').length;
  const delayedBuses = buses.filter(b => b.status === 'DELAYED').length;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const criticalSOS = activeAlerts.filter(a => a.type === 'SOS');

  // Calculate On-Time Percentage
  const onTimePercentage = totalBuses > 0
    ? Math.round(((totalBuses - delayedBuses) / totalBuses) * 100)
    : 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* Total Fleet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fleet</span>
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <BusIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{totalBuses}</span>
          <span className="text-xs text-slate-400 font-medium">Buses Registered</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Nagpur & JIT Corridors</p>
      </div>

      {/* Active En-Route */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En-Route Active</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{activeBuses}</span>
          <span className="text-xs text-slate-400 font-medium">Transmitting Live</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Streaming Telemetry</p>
      </div>

      {/* On-Time Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Time Score</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">{onTimePercentage}%</span>
          <span className="text-xs text-slate-400 font-medium">Schedule Adherence</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">{delayedBuses} Bus delayed</p>
      </div>

      {/* Active Delay / SOS Incidents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
        {criticalSOS.length > 0 && (
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse" />
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Incidents</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            criticalSOS.length > 0
              ? 'bg-red-600/20 text-red-400 animate-bounce'
              : 'bg-amber-600/20 text-amber-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className={`text-2xl sm:text-3xl font-black ${
            criticalSOS.length > 0 ? 'text-red-400 animate-pulse' : 'text-amber-400'
          }`}>
            {activeAlerts.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">Pending Resolution</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {criticalSOS.length > 0 ? 'CRITICAL SOS ALERT ACTIVE' : 'Traffic delays / breakdowns'}
        </p>
      </div>

    </div>
  );
};
