import React from 'react';
import { Route, RouteStop } from '../../types';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface StopSelectorProps {
  routes: Route[];
  selectedRoute: Route;
  selectedStop: RouteStop;
  onSelectRoute: (route: Route) => void;
  onSelectStop: (stop: RouteStop) => void;
}

export const StopSelector: React.FC<StopSelectorProps> = ({
  routes,
  selectedRoute,
  selectedStop,
  onSelectRoute,
  onSelectStop
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bus Route & Boarding Stop</h2>
        </div>
        <span className="text-[11px] text-blue-400 font-medium bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-900">
          Nagpur Fleet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Route Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <span>Select College Bus Route</span>
          </label>
          <div className="relative">
            <select
              value={selectedRoute.id}
              onChange={(e) => {
                const found = routes.find(r => r.id === e.target.value);
                if (found) onSelectRoute(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeCode} — {r.name} ({r.totalDistanceKm} km)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              ▼
            </div>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {selectedRoute.description}
          </p>
        </div>

        {/* Stop Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Your Pickup Stop</span>
          </label>
          <div className="relative">
            <select
              value={selectedStop.id}
              onChange={(e) => {
                const found = selectedRoute.stops.find(s => s.id === e.target.value);
                if (found) onSelectStop(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
            >
              {selectedRoute.stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  Stop #{stop.order + 1}: {stop.name} (Sched: {stop.scheduledTime})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              ▼
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Morning Pickup: {selectedStop.scheduledTime}</span>
            </span>
            <span className="text-emerald-400 font-semibold">1 km Geofence Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
