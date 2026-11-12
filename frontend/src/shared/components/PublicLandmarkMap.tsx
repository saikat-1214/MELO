import React, { useState } from 'react';
import { ActivitySummary } from '@/shared/types/activity';
import { MapPin, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublicLandmarkMapProps {
  activities: ActivitySummary[];
}

export const PublicLandmarkMap: React.FC<PublicLandmarkMapProps> = ({ activities }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivitySummary | null>(null);

  // Normalizes landmark coordinates or computes stable layout positions
  const getCoordinates = (act: ActivitySummary, index: number) => {
    // If exact lat/long not set, distribute pins deterministically on public grid
    const baseLat = 22.5726; // Kolkata center
    const baseLng = 88.3639;

    const angle = (index * (360 / Math.max(activities.length, 1))) * (Math.PI / 180);
    const radius = 0.04 + (index % 3) * 0.02;

    const lat = act.approx_latitude || baseLat + Math.sin(angle) * radius;
    const lng = act.approx_longitude || baseLng + Math.cos(angle) * radius;

    // Map to SVG coordinates percentage [15% to 85%]
    const x = Math.min(85, Math.max(15, 50 + ((lng - baseLng) / 0.1) * 35));
    const y = Math.min(85, Math.max(15, 50 - ((lat - baseLat) / 0.1) * 35));

    return { x, y };
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/90 bg-slate-900 text-white shadow-soft overflow-hidden min-h-[480px]">
      {/* Map Header with Safety Guarantee */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Public Landmarks Only</span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-[11px] text-slate-300">
            {activities.length} outings plotted on public transit &amp; cultural hubs
          </span>
        </div>

        <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
          Geospatial View
        </span>
      </div>

      {/* Styled Map Grid Surface */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/60 opacity-95">
        {/* SVG Grid Lines */}
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Ambient Map Contours & Roads simulation */}
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-teal-500/10 transform -rotate-12 blur-[1px]" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gradient-to-b from-indigo-500/10 via-indigo-500/30 to-emerald-500/10 transform rotate-6 blur-[1px]" />
      </div>

      {/* Activity Landmark Pins */}
      <div className="absolute inset-0 z-10 p-8">
        {activities.map((act, idx) => {
          const { x, y } = getCoordinates(act, idx);
          const isSelected = selectedActivity?.id === act.id;

          return (
            <div
              key={act.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => setSelectedActivity(act)}
            >
              {/* Pulse ripple */}
              <div
                className={`absolute -inset-3 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none ${
                  isSelected ? 'scale-150 opacity-70' : ''
                }`}
              />

              {/* Pin Bubble */}
              <div
                className={`relative flex items-center gap-1.5 rounded-2xl px-3 py-1.5 shadow-xl transition-all duration-200 border ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-white scale-110 shadow-emerald-500/50'
                    : 'bg-slate-900 text-slate-100 border-emerald-500/50 hover:bg-emerald-600 hover:text-white hover:scale-105'
                }`}
              >
                <span className="text-sm">{act.category.icon}</span>
                <span className="text-[11px] font-bold max-w-[120px] truncate">
                  {act.location_landmark}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Selected Outing Popup Card */}
      {selectedActivity && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-30 animate-in slide-in-from-bottom duration-200">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-5 shadow-2xl text-white space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-white/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  {selectedActivity.category.icon} {selectedActivity.category.name}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedActivity.spots_left} spots left
                </span>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white line-clamp-1">
                {selectedActivity.title}
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{selectedActivity.location_landmark} ({selectedActivity.city})</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Organized by {selectedActivity.host.display_name}
              </span>
              <Link
                to={`/activities/${selectedActivity.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
