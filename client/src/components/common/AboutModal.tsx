import React from 'react';
import { X, Award, BookOpen, Layers, Cpu, ShieldCheck, MapPin } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-blue-950/40 relative overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Project Overview & Academic Credits</h2>
              <p className="text-xs text-blue-400 font-medium">B.Tech Computer Science and Engineering (Session 2026–27)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Title Card */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/50 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700">
            Capstone Engineering Project • Group G6
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            Smart College Bus-Tracking & Safety System Using Real-Time GPS Tracking and ETA Prediction
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Institution:</strong> Department of Computer Science and Engineering, Jhulelal Institute of Technology, Nagpur
            <br />
            <strong>University Affiliation:</strong> Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)
          </p>
        </div>

        {/* Faculty and institution */}
        <div className="mt-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">Faculty Supervision</h4>
            <p className="text-xs text-slate-400">Assistant Professor, Department of Computer Science and Engineering</p>
            <p className="text-xs text-slate-400">Jhulelal Institute of Technology, Lonara, Nagpur</p>
          </div>
        </div>

        {/* Team contributions without personal details */}
        <div className="mt-5">
          <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2 mb-3">
            <span>Project Team Contributions</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Real-Time Telemetry & Socket Pipeline',
              'Dynamic ETA Prediction Engine',
              'Geofence Guardian & Proximity Logic',
              'Driver Console & Touch UI',
              'Full-Stack Integration & Architecture',
              'Admin Fleet Control & Incident Stream',
            ].map((contribution) => (
              <div key={contribution} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                <p className="text-xs font-bold text-slate-100">{contribution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mathematical Formulas Implemented */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Mathematical & Algorithmic Formulation</span>
          </h4>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-400 font-semibold font-mono">
              <span>1. Haversine Distance (Great-Circle)</span>
              <span>R = 6371 km</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
              d = 2R · asin(√(sin²(Δlat/2) + cos(lat₁)cos(lat₂)sin²(Δlon/2)))
            </p>
            <p className="text-slate-400 text-[11px]">
              Calculates the shortest distance over the Earth's surface between live bus GPS coordinates and scheduled stops.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-semibold font-mono">
              <span>2. Speed-Adjusted Dynamic ETA Formula</span>
              <span>Nominal Speed: 25 km/h</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
              ETA = (d_rem / max(v_current, 25)) · 60 + (N_stops · 1.5 mins) + Traffic_penalty
            </p>
            <p className="text-slate-400 text-[11px]">
              Accounts for vehicle velocity, intermediate boarding dwell time (1.5 min/stop), and live traffic delay adjustments.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-semibold font-mono">
              <span>3. Geofence Boundary Detection</span>
              <span>Threshold: 1.0 km</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Continuously computes distance to the student's designated stop. When distance ≤ 1.0 km, triggers the automated approach push banner: "Bus is approaching your stop!".
            </p>
          </div>
        </div>

        {/* Tech Stack Tags */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {['React 18', 'TypeScript', 'Leaflet.js', 'Socket.io', 'Express.js', 'Node.js', 'Tailwind CSS', 'OpenStreetMap', 'HTML5 Geolocation'].map((tech) => (
              <span key={tech} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition text-xs"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};