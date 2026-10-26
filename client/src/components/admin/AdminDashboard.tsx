import React, { useState } from 'react';
import { Bus, Route, Alert } from '../../types';
import { FleetOverview } from './FleetOverview';
import { LiveFleetMap } from './LiveFleetMap';
import { IncidentLog } from './IncidentLog';
import { Bus as BusIcon, Users, Phone, MapPin, Gauge } from 'lucide-react';

interface AdminDashboardProps {
  buses: Bus[];
  routes: Route[];
  alerts: Alert[];
  onResolveAlert: (alertId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  buses,
  routes,
  alerts,
  onResolveAlert
}) => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Fleet Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Central Transport Fleet Dispatch Command
          </h2>
          <p className="text-xs text-slate-400">
            Jhulelal Institute of Technology, Nagpur • Real-Time GPS Tracking & Safety Administration
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
          Session 2026–27 • Nagpur Fleet
        </div>
      </div>

      {/* Overview KPI Cards */}
      <FleetOverview buses={buses} alerts={alerts} />

      {/* Main Grid: Bird's-Eye Live Fleet Map & Incident Stream Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-Bus Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Nagpur Metropolitan Multi-Bus Bird's-Eye Map</span>
            </span>
            <span className="text-[11px] text-blue-400 font-semibold bg-blue-950/70 px-2 py-0.5 rounded border border-blue-900">
              Live Coordinate Sync
            </span>
          </div>
          <LiveFleetMap buses={buses} routes={routes} onSelectBus={setSelectedBus} />
        </div>

        {/* Right Column: Live Incident & Delay Stream */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Incident Dispatch Console
          </span>
          <IncidentLog alerts={alerts} onResolveAlert={onResolveAlert} />
        </div>
      </div>

      {/* Active Fleet Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BusIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Fleet Operational Status & Driver Registry
            </h3>
          </div>
          <span className="text-xs text-slate-400">{buses.length} Vehicles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-3 rounded-l-lg">Bus Identification</th>
                <th className="py-3 px-3">Driver Name & Contact</th>
                <th className="py-3 px-3">Assigned Route</th>
                <th className="py-3 px-3">Live Telemetry</th>
                <th className="py-3 px-3">Occupancy</th>
                <th className="py-3 px-3 rounded-r-lg">Trip Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {buses.map((bus) => {
                const route = routes.find(r => r.id === bus.routeId);

                return (
                  <tr key={bus.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">{bus.busNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{bus.registrationNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{bus.driverName}</div>
                      <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{bus.driverPhone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-xs">{route?.name || 'Unassigned'}</div>
                      <div className="text-[10px] text-slate-400">Next: Stop #{bus.currentStopIndex + 1}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1 font-bold text-white">
                        <Gauge className="w-3 h-3 text-blue-400" />
                        <span>{Math.round(bus.currentLocation.speed)} km/h</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {bus.currentLocation.lat.toFixed(4)}, {bus.currentLocation.lng.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-slate-200">{bus.currentOccupancy}</span>
                        <span className="text-slate-500">/ {bus.capacity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          bus.status === 'EN_ROUTE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : bus.status === 'DELAYED'
                            ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
