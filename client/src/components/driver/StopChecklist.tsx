import React from 'react';
import { Route, RouteStop } from '../../types';
import { CheckCircle2, Circle, Clock, Forward, Check, MapPin } from 'lucide-react';

interface StopChecklistProps {
  route: Route;
  currentStopIndex: number;
  onAdvanceStop: (stopIndex: number, action: 'REACHED' | 'SKIPPED') => void;
}

export const StopChecklist: React.FC<StopChecklistProps> = ({
  route,
  currentStopIndex,
  onAdvanceStop
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sequential Route Progress Checklist
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Stop <strong className="text-white">{Math.min(currentStopIndex + 1, route.stops.length)}</strong> of {route.stops.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {route.stops.map((stop, index) => {
          const isPassed = index < currentStopIndex;
          const isCurrent = index === currentStopIndex;
          const isUpcoming = index > currentStopIndex;

          return (
            <div
              key={stop.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-950/50'
                  : isPassed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                
                {/* Left: Index, Name & Schedule */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : index + 1}
                  </div>

                  <div>
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? 'text-white'
                          : isPassed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-300'
                      }`}
                    >
                      {stop.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Sched: {stop.scheduledTime}</span>
                      </span>
                      {isCurrent && (
                        <span className="text-emerald-400 font-semibold">• Approaching / Boarding</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Driver Action Buttons */}
                {isCurrent && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAdvanceStop(index, 'SKIPPED')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition"
                      title="Skip this stop (no student boarding)"
                    >
                      <Forward className="w-3.5 h-3.5" />
                      <span>Skip</span>
                    </button>

                    <button
                      onClick={() => onAdvanceStop(index, 'REACHED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950 flex items-center space-x-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Depart</span>
                    </button>
                  </div>
                )}

                {isPassed && (
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-900">
                    Departed
                  </span>
                )}

                {isUpcoming && (
                  <span className="text-[11px] text-slate-400">
                    Upcoming
                  </span>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
