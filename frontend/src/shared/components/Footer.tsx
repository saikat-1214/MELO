import React from 'react';
import { ShieldCheck, MapPin, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white mt-auto">
      {/* Safety Commitment Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-slate-200 py-6 px-4 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>
              <strong className="text-white">Community Trust &amp; Safety:</strong> SocialConnect is strictly for shared real-world experiences and platonic companionship. All meetups take place at designated public venues.
            </span>
          </div>
          <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Strictly Non-Dating
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-bold text-xs shadow-sm">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                Social<span className="text-gradient-brand">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm">
              Empowering people to connect through shared activities — festivals, stadium matches, treks, food, and gaming.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition">
              Explore Activities
            </Link>
            <Link to="/recommendations" className="hover:text-emerald-600 transition">
              AI Matchmaker
            </Link>
            <Link to="/activities/create" className="hover:text-emerald-600 transition">
              Host an Outing
            </Link>
            <Link to="/safety" className="hover:text-emerald-600 transition">
              Safety Charter
            </Link>
            <Link to="/login" className="hover:text-emerald-600 transition">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} SocialConnect Platform. Designed for meaningful real-world friendships.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Public Landmarks Only
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              Vetted Attendees
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
