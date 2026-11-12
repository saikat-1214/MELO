import React from 'react';
import { Link } from 'react-router-dom';

interface MeloLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

export const MeloLogo: React.FC<MeloLogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Human Connection Icon (Purple to Orange gradient) */}
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7137A8] via-[#9B51CA] to-[#FF9B32] text-white shadow-md shadow-[#7137A8]/20 group-hover:scale-105 group-hover:shadow-[#FF9B32]/30 transition-all duration-300 ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {/* Two connected individuals forming a bridge */}
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          {/* Central spark */}
          <circle cx="12" cy="12" r="1" fill="#FF9B32" stroke="none" />
        </svg>

        {/* Glow halo on hover */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#7137A8] to-[#FF9B32] opacity-0 group-hover:opacity-30 blur-sm transition-opacity" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold tracking-tight font-sans ${textSizes[size]} ${
              inverted ? 'text-white' : 'text-[#26232B]'
            }`}
          >
            MEL<span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#7137A8] to-[#FF9B32]">
              O
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#FF9B32] font-black -top-0.5">
                ✦
              </span>
            </span>
          </span>
          <span className="hidden sm:inline-block rounded-md bg-[#F1EAF8] px-1.5 py-0.5 text-[9px] font-bold text-[#7137A8] uppercase tracking-wider border border-[#7137A8]/20">
            Community
          </span>
        </div>

        {showTagline && (
          <span
            className={`hidden sm:block text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
              inverted ? 'text-slate-300' : 'text-[#85828A]'
            }`}
          >
            Discover • Connect • Experience
          </span>
        )}
      </div>
    </Link>
  );
};
