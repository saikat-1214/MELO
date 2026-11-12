import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MeloLogo } from '@/shared/components/MeloLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8E7E2] bg-white mt-auto">
      {/* Safety Commitment Ribbon */}
      <div className="bg-gradient-to-r from-[#321044] via-[#481961] to-[#7137A8] text-white py-4 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-white/10 text-[#FF9B32] flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-slate-200">
              <strong className="text-white font-bold">Community Safety &amp; Trust:</strong> MELO is strictly for real-world shared experiences and platonic companionship. Meetups take place at verified public spots.
            </span>
          </div>
          <span className="rounded-full bg-[#FF9B32]/20 text-[#FF9B32] border border-[#FF9B32]/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider shrink-0">
            Strictly Non-Dating
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <MeloLogo size="md" />
            <p className="text-xs text-[#55545C] leading-relaxed">
              Bringing people together through shared interests, activities, and meaningful experiences.
            </p>
            <p className="text-[11px] font-bold text-[#7137A8]">
              "Find your people. Share your world."
            </p>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26232B] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#55545C]">
              <li>
                <Link to="/explore" className="hover:text-[#7137A8] transition">
                  Explore Activities
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-[#7137A8] transition">
                  AI Activity Matches
                </Link>
              </li>
              <li>
                <Link to="/activities/create" className="hover:text-[#7137A8] transition">
                  Host an Activity
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-[#7137A8] transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: MELO Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26232B] mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs text-[#55545C]">
              <li>
                <Link to="/safety" className="hover:text-[#7137A8] transition">
                  Safety Charter &amp; Guidelines
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#7137A8] transition">
                  Public Landmark Venues
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#7137A8] transition">
                  Join the Community
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#7137A8] transition">
                  Member Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#26232B] mb-4">
              Safety &amp; Privacy
            </h4>
            <ul className="space-y-2.5 text-xs text-[#55545C]">
              <li>
                <span className="text-[#85828A]">Privacy Shield Standard</span>
              </li>
              <li>
                <span className="text-[#85828A]">Platonic Community Code</span>
              </li>
              <li>
                <span className="text-[#85828A]">Terms of Experience</span>
              </li>
              <li>
                <span className="text-[#85828A]">Verified Landmark Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E8E7E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#85828A]">
          <p>© {new Date().getFullYear()} MELO. All rights reserved. Built for authentic human connections.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted for real-world friendships</span>
            <Heart className="h-3 w-3 text-[#FF9B32] fill-[#FF9B32]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
