import React from 'react';
import { BookOpen, Compass, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Academic Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800/80">
          
          {/* Project & Department Identity */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Smart College Bus-Tracking & Safety System</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Major Capstone Project • III Semester B.Tech Computer Science and Engineering.
              Department of Computer Science and Engineering,
              <br />
              <strong className="text-slate-300">Jhulelal Institute of Technology, Nagpur</strong>
            </p>
            <p className="text-[11px] text-blue-400 font-medium">
              Affiliated to Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU) • Session 2026–27
            </p>
          </div>

        </div>

        {/* Technical Highlights & Disclaimer Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Haversine Great-Circle ETA Engine</span>
            </span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>1.0 km Geofence Approach Guardian</span>
            </span>
          </div>
          <div>
            © Session 2026–27 • Jhulelal Institute of Technology, Nagpur. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
