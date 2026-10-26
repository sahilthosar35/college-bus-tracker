import React from 'react';
import { GPSReading } from '../../hooks/useDriverGPS';
import { Compass, Gauge, MapPin, Radio, RefreshCw, Smartphone } from 'lucide-react';

interface GPSStatusProps {
  reading: GPSReading | null;
  isTracking: boolean;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  gpsError: string | null;
}

export const GPSStatus: React.FC<GPSStatusProps> = ({
  reading,
  isTracking,
  isSimulating,
  onToggleSimulation,
  gpsError
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Radio className={`w-4 h-4 ${isTracking ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              In-Cab GPS Telemetry Transmitter
            </h3>
            <p className="text-[11px] text-slate-400">Pipes HTML5 coordinates over WebSockets every 3s</p>
          </div>
        </div>

        {/* Simulator vs Real GPS Switcher Button */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
            isSimulating
              ? 'bg-purple-950/80 text-purple-300 border-purple-800 hover:bg-purple-900/80'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80'
          }`}
        >
          {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'Mode: Route Simulation' : 'Mode: Hardware GPS'}</span>
        </button>
      </div>

      {/* GPS Error Warning */}
      {gpsError && (
        <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-200 rounded-xl text-xs flex items-center justify-between">
          <span>⚠️ {gpsError}</span>
          {!isSimulating && (
            <button
              onClick={onToggleSimulation}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] ml-2 shrink-0"
            >
              Enable Simulator
            </button>
          )}
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Speed */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Vehicle Speed</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {reading ? Math.round(reading.speed) : 0}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold ml-1">km/h</span>
        </div>

        {/* Heading */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Bearing Angle</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            {reading ? Math.round(reading.heading) : 0}°
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">Direction</span>
        </div>

        {/* Latitude */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latitude</span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100 block truncate">
            {reading ? reading.lat.toFixed(5) : '21.14580'}
          </span>
          <span className="text-[10px] text-slate-500">North</span>
        </div>

        {/* Longitude */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>Longitude</span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100 block truncate">
            {reading ? reading.lng.toFixed(5) : '79.08820'}
          </span>
          <span className="text-[10px] text-slate-500">East (Nagpur)</span>
        </div>
      </div>
    </div>
  );
};
