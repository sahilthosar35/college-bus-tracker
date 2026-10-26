import React from 'react';
import { ETAResult, Bus, RouteStop } from '../../types';
import { Clock, Gauge, Compass, AlertCircle, CheckCircle2, Phone, User, Radio } from 'lucide-react';

interface ETABadgeProps {
  etaResult: ETAResult | null;
  bus: Bus | null;
  selectedStop: RouteStop;
  lastUpdateSecondsAgo: number;
  isWithinGeofence: boolean;
}

export const ETABadge: React.FC<ETABadgeProps> = ({
  etaResult,
  bus,
  selectedStop,
  lastUpdateSecondsAgo,
  isWithinGeofence
}) => {
  if (!bus || !etaResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-500 animate-spin" />
        <p className="text-sm">Calculating real-time telemetry and dynamic ETA...</p>
      </div>
    );
  }

  // Determine Badge Styling
  const getStatusBadge = () => {
    switch (etaResult.statusBadge) {
      case 'ON_TIME':
        return {
          label: 'On Time',
          bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
          dot: 'bg-emerald-400'
        };
      case 'MODERATE_DELAY':
        return {
          label: `Moderate Delay (+${etaResult.delayMinutes}m)`,
          bg: 'bg-amber-950/80 text-amber-400 border-amber-800',
          dot: 'bg-amber-400'
        };
      case 'HEAVY_TRAFFIC':
        return {
          label: `Heavy Traffic (+${etaResult.delayMinutes}m)`,
          bg: 'bg-red-950/80 text-red-400 border-red-800',
          dot: 'bg-red-400'
        };
    }
  };

  const statusConfig = getStatusBadge();

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      
      {/* Top Banner: Geofence Trigger Highlight if bus is within 1 km */}
      {isWithinGeofence && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-lg shadow-emerald-900/40 animate-pulse">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 animate-ping" />
            <span className="font-extrabold text-xs sm:text-sm">
              BUS IS APPROACHING YOUR STOP! (Within 1.0 km Geofence)
            </span>
          </div>
          <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded-full font-mono">
            {etaResult.distanceKm} km
          </span>
        </div>
      )}

      {/* Main Grid: Left ETA Highlight / Right Telemetry Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Left Side: Dynamic ETA Announcement */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
              <span>{statusConfig.label}</span>
            </span>

            <span className="text-xs text-slate-400">
              Stop: <strong className="text-white">{selectedStop.name}</strong>
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-baseline space-x-2">
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {etaResult.formattedEta}
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-400">
                • {etaResult.distanceKm} km away
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {etaResult.intermediateStopsCount > 0 ? (
                <span>
                  Passing <strong className="text-slate-200">{etaResult.intermediateStopsCount}</strong> stop(s) before yours (dwell time added)
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">Direct next stop on active corridor</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Speed, Signal Updates & Driver Card */}
        <div className="md:col-span-5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
          
          {/* Real-time Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-0.5">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Speed</span>
              </div>
              <span className="text-base sm:text-lg font-black text-white">
                {Math.round(bus.currentLocation.speed)} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS Signal</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {lastUpdateSecondsAgo <= 3 ? 'Live (1s ago)' : `${lastUpdateSecondsAgo}s ago`}
              </span>
            </div>
          </div>

          {/* Driver & Contact Bar */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{bus.driverName}</p>
                <p className="text-[10px] text-slate-400">{bus.busNumber.split('-')[0]}</p>
              </div>
            </div>

            <a
              href={`tel:${bus.driverPhone}`}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Driver</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
