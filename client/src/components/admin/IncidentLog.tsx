import React from 'react';
import { Alert } from '../../types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Wrench, TrafficCone, Check } from 'lucide-react';

interface IncidentLogProps {
  alerts: Alert[];
  onResolveAlert: (alertId: string) => void;
}

export const IncidentLog: React.FC<IncidentLogProps> = ({ alerts, onResolveAlert }) => {
  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800 animate-pulse';
      case 'HIGH':
        return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'LOW':
        return 'bg-blue-950 text-blue-400 border-blue-800';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'SOS':
        return <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />;
      case 'BREAKDOWN':
        return <Wrench className="w-5 h-5 text-orange-400" />;
      case 'TRAFFIC_JAM':
        return <TrafficCone className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Incident & SOS Telemetry Stream
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {alerts.filter(a => a.status === 'ACTIVE').length} Active
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
            No incidents reported. All fleet corridors running normally.
          </div>
        ) : (
          alerts.map((alert) => {
            const isActive = alert.status === 'ACTIVE';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? alert.severity === 'CRITICAL'
                      ? 'bg-red-950/40 border-red-700/80 shadow-lg shadow-red-950/40'
                      : 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Icon, Bus & Message */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-black text-white">{alert.busNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-snug">{alert.message}</p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </span>
                        <span>Reported By: <strong className="text-slate-300">{alert.reportedBy}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Resolve Action */}
                  {isActive ? (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                      title="Mark as Resolved"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Resolve</span>
                    </button>
                  ) : (
                    <span className="shrink-0 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                      Resolved
                    </span>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
