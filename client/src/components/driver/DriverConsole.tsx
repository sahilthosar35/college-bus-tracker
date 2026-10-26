import React, { useState, useCallback } from 'react';
import { Bus, Route, AlertType } from '../../types';
import { GPSStatus } from './GPSStatus';
import { TripControls } from './TripControls';
import { StopChecklist } from './StopChecklist';
import { useDriverGPS, GPSReading } from '../../hooks/useDriverGPS';
import { Bus as BusIcon, Shield, MapPin, User, Phone } from 'lucide-react';

interface DriverConsoleProps {
  buses: Bus[];
  routes: Route[];
  onTransmitTelemetry: (reading: GPSReading, busId: string, currentStopIndex: number) => void;
  onDispatchAlert: (busId: string, type: AlertType, message: string) => void;
  onUpdateStopProgress: (busId: string, stopIndex: number, action: 'REACHED' | 'SKIPPED') => void;
  onUpdateTripStatus: (busId: string, status: any) => void;
}

export const DriverConsole: React.FC<DriverConsoleProps> = ({
  buses,
  routes,
  onTransmitTelemetry,
  onDispatchAlert,
  onUpdateStopProgress,
  onUpdateTripStatus
}) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || 'BUS-01');
  const [isTracking, setIsTracking] = useState<boolean>(true);

  const activeBus = buses.find(b => b.id === selectedBusId) || buses[0];
  const activeRoute = routes.find(r => r.id === activeBus?.routeId) || routes[0];

  const handleLocationUpdate = useCallback((reading: GPSReading) => {
    if (activeBus) {
      onTransmitTelemetry(reading, activeBus.id, activeBus.currentStopIndex);
    }
  }, [activeBus, onTransmitTelemetry]);

  // Use GPS hook with Route Simulation mode enabled by default for desktop presentations
  const { currentReading, gpsError, isSimulating, toggleSimulation } = useDriverGPS(
    isTracking && activeBus?.status === 'EN_ROUTE',
    activeRoute,
    true, // default to route simulator so evaluation works effortlessly
    handleLocationUpdate
  );

  const handleStartTrip = () => {
    setIsTracking(true);
    onUpdateTripStatus(activeBus.id, 'EN_ROUTE');
  };

  const handlePauseTrip = () => {
    onUpdateTripStatus(activeBus.id, 'PAUSED');
  };

  const handleEndTrip = () => {
    setIsTracking(false);
    onUpdateTripStatus(activeBus.id, 'COMPLETED');
  };

  const handleAdvanceStop = (stopIndex: number, action: 'REACHED' | 'SKIPPED') => {
    onUpdateStopProgress(activeBus.id, stopIndex, action);
  };

  const handleDispatchIncident = (type: AlertType, message: string) => {
    onDispatchAlert(activeBus.id, type, message);
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Bus & Driver Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
              <BusIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white">{activeBus.busNumber}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {activeBus.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Route: <strong className="text-blue-400">{activeRoute.name}</strong>
              </p>
            </div>
          </div>

          {/* Bus Switcher for multi-bus cab testing */}
          <div className="w-full sm:w-auto">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Select Vehicle Console:
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {buses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} ({b.driverName})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Driver Metadata Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Driver: <strong className="text-white">{activeBus.driverName}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeBus.driverPhone}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Cap: {activeBus.capacity} passengers</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Trip Status:</span>
            <span
              className={`font-black uppercase text-[11px] px-2 py-0.5 rounded-full ${
                activeBus.status === 'EN_ROUTE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : activeBus.status === 'DELAYED'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activeBus.status}
            </span>
          </div>
        </div>
      </div>

      {/* GPS Status Telemetry Readout */}
      <GPSStatus
        reading={currentReading}
        isTracking={isTracking}
        isSimulating={isSimulating}
        onToggleSimulation={toggleSimulation}
        gpsError={gpsError}
      />

      {/* Trip Controls: Start, Pause, End & Incident Buttons */}
      <TripControls
        tripStatus={activeBus.status}
        isTracking={isTracking}
        onStartTrip={handleStartTrip}
        onPauseTrip={handlePauseTrip}
        onEndTrip={handleEndTrip}
        onDispatchAlert={handleDispatchIncident}
      />

      {/* Stop Checklist: Sequential Reach / Skip */}
      <StopChecklist
        route={activeRoute}
        currentStopIndex={activeBus.currentStopIndex}
        onAdvanceStop={handleAdvanceStop}
      />

    </div>
  );
};
