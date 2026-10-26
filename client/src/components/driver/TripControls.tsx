import React, { useState } from 'react';
import { Play, Pause, Square, AlertTriangle, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';
import { BusStatus, AlertType } from '../../types';

interface TripControlsProps {
  tripStatus: BusStatus;
  isTracking: boolean;
  onStartTrip: () => void;
  onPauseTrip: () => void;
  onEndTrip: () => void;
  onDispatchAlert: (type: AlertType, message: string) => void;
}

export const TripControls: React.FC<TripControlsProps> = ({
  tripStatus,
  isTracking,
  onStartTrip,
  onPauseTrip,
  onEndTrip,
  onDispatchAlert
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTrafficAlert = () => {
    onDispatchAlert('TRAFFIC_JAM', 'Heavy road traffic / congestion reported by driver on active route.');
    triggerToast('Traffic Delay Broadcast Sent to Fleet Admins!');
  };

  const handleBreakdownAlert = () => {
    onDispatchAlert('BREAKDOWN', 'Mechanical breakdown / flat tyre reported. Support vehicle requested.');
    triggerToast('Vehicle Breakdown Broadcast Sent to College Admin!');
  };

  const handleSOSAlert = () => {
    onDispatchAlert('SOS', 'CRITICAL EMERGENCY reported from vehicle cab. Immediate response requested.');
    triggerToast('CRITICAL SOS SIREN BROADCASTED TO CAMPUS SECURITY!');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Trip Lifecycle Action Buttons */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
          Trip Lifecycle Commands
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Start Journey */}
          <button
            onClick={onStartTrip}
            disabled={tripStatus === 'EN_ROUTE'}
            className={`py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
              tripStatus === 'EN_ROUTE'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START JOURNEY</span>
          </button>

          {/* Pause Tracking */}
          <button
            onClick={onPauseTrip}
            disabled={tripStatus !== 'EN_ROUTE'}
            className={`py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
              tripStatus !== 'EN_ROUTE'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
            }`}
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>PAUSE TRIP</span>
          </button>

          {/* End Journey */}
          <button
            onClick={onEndTrip}
            disabled={tripStatus === 'COMPLETED' || tripStatus === 'IDLE'}
            className={`py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
              tripStatus === 'COMPLETED' || tripStatus === 'IDLE'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-red-700 hover:bg-red-600 text-white shadow-red-950/50'
            }`}
          >
            <Square className="w-5 h-5 fill-current" />
            <span>END JOURNEY</span>
          </button>

        </div>
      </div>

      {/* One-Tap In-Cab Incident Dispatch Console */}
      <div className="pt-2 border-t border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
          One-Tap Driver Incident Dispatch
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={handleTrafficAlert}
            className="p-3 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/80 rounded-xl text-amber-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Report Traffic Jam</span>
          </button>

          <button
            onClick={handleBreakdownAlert}
            className="p-3 bg-orange-950/70 hover:bg-orange-900/80 border border-orange-700/80 rounded-xl text-orange-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <Wrench className="w-4 h-4 text-orange-400" />
            <span>Vehicle Breakdown</span>
          </button>

          <button
            onClick={handleSOSAlert}
            className="p-3 bg-red-950/90 hover:bg-red-900 border border-red-600 rounded-xl text-red-200 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50 animate-pulse transition"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Accident / SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
