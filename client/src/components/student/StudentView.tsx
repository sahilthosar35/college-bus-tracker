import React, { useState, useEffect } from 'react';
import { Route, RouteStop, Bus, Alert } from '../../types';
import { StopSelector } from './StopSelector';
import { ETABadge } from './ETABadge';
import { MapContainer } from './MapContainer';
import { useETA } from '../../hooks/useETA';
import { BellRing, ShieldAlert, Phone, Info, Radio } from 'lucide-react';

interface StudentViewProps {
  routes: Route[];
  buses: Bus[];
  activeAlerts: Alert[];
  onOpenSOS: () => void;
  onOpenAbout: () => void;
  geofencePushAlert?: string | null;
}

export const StudentView: React.FC<StudentViewProps> = ({
  routes,
  buses,
  activeAlerts,
  onOpenSOS,
  onOpenAbout,
  geofencePushAlert
}) => {
  const [selectedRoute, setSelectedRoute] = useState<Route>(routes[0]);
  const [selectedStop, setSelectedStop] = useState<RouteStop>(routes[0].stops[2] || routes[0].stops[0]);
  const [lastUpdateSecondsAgo, setLastUpdateSecondsAgo] = useState<number>(1);

  // Match corresponding bus for this route
  const currentBus = buses.find(b => b.routeId === selectedRoute.id) || buses[0];

  // Check if traffic alert exists for this bus
  const isTrafficAlertActive = activeAlerts.some(
    a => a.busId === currentBus?.id && (a.type === 'TRAFFIC_JAM' || a.type === 'BREAKDOWN') && a.status === 'ACTIVE'
  );

  // Real-time Dynamic ETA Calculation Hook
  const { etaResult, isWithinGeofence } = useETA(
    currentBus,
    selectedStop,
    selectedRoute.stops,
    isTrafficAlertActive
  );

  // Update timer seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdateSecondsAgo(prev => (prev >= 60 ? 1 : prev + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBus?.currentLocation.lastUpdated]);

  const handleSelectRoute = (newRoute: Route) => {
    setSelectedRoute(newRoute);
    if (newRoute.stops.length > 0) {
      setSelectedStop(newRoute.stops[2] || newRoute.stops[0]);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Geofence Push Notification Banner */}
      {geofencePushAlert && (
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <BellRing className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-extrabold text-sm sm:text-base">Proximity Approach Alert</p>
              <p className="text-xs text-emerald-100">{geofencePushAlert}</p>
            </div>
          </div>
          <span className="text-[10px] bg-black/30 px-3 py-1 rounded-full uppercase font-bold tracking-wider">
            1 km Ring
          </span>
        </div>
      )}

      {/* Traffic or Delay Alert Warning Banner */}
      {isTrafficAlertActive && (
        <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-bold text-sm">Traffic Delay Advisory</p>
              <p className="text-xs text-amber-100">
                Heavy congestion on Nagpur corridor. Arrival times adjusted automatically by the ETA engine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route & Stop Dropdown Filter Card */}
      <StopSelector
        routes={routes}
        selectedRoute={selectedRoute}
        selectedStop={selectedStop}
        onSelectRoute={handleSelectRoute}
        onSelectStop={setSelectedStop}
      />

      {/* Live Arrival Status Card (ETA Badge) */}
      <ETABadge
        etaResult={etaResult}
        bus={currentBus}
        selectedStop={selectedStop}
        lastUpdateSecondsAgo={lastUpdateSecondsAgo}
        isWithinGeofence={isWithinGeofence}
      />

      {/* Interactive Leaflet Map Container */}
      <MapContainer
        bus={currentBus}
        route={selectedRoute}
        selectedStop={selectedStop}
        isWithinGeofence={isWithinGeofence}
      />

      {/* Emergency Assistance Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Student & Parent Safety Helpline</p>
            <p className="text-[11px] text-slate-400">Campus Control Room: +91 712 266 7400 • Available 24x7</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={onOpenSOS}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-red-600/20 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
          <button
            onClick={onOpenAbout}
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span>Project Details</span>
          </button>
        </div>
      </div>

    </div>
  );
};
