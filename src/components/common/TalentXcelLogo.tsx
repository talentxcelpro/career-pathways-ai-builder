import React from 'react';

interface TalentXcelLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

export const TalentXcelLogo: React.FC<TalentXcelLogoProps> = ({
  className = '',
  iconSize = 24,
  textSize = 'text-base sm:text-lg',
  showText = true,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark' || theme === 'auto';

  return (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* Premium Vector Emblem matching official brand asset */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]"
        >
          <defs>
            <linearGradient id="txc-needle-grad" x1="12" y1="20" x2="23" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="txc-glow-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background subtle ring disc */}
          <circle cx="16" cy="16" r="14" fill="url(#txc-glow-grad)" />

          {/* Circular outer gauge arc */}
          <path
            d="M 17 28 A 12 12 0 1 1 28 17"
            stroke={isDark ? "#FFFFFF" : "#0F172A"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Electric Blue dynamic needle */}
          <path
            d="M 12 20 L 22.5 9.5"
            stroke="url(#txc-needle-grad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* Center pivot dot */}
          <circle
            cx="12"
            cy="20"
            r="2"
            fill="#38BDF8"
          />
          {/* Needle tip sparkle */}
          <circle
            cx="22.5"
            cy="9.5"
            r="1"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Premium Apple/Linear Typography */}
      {showText && (
        <span className={`${textSize} font-black tracking-tight flex items-center leading-none`}>
          <span 
            className="font-extrabold tracking-[-0.03em]" 
            style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            Talent
          </span>
          <span 
            className="font-black tracking-[-0.02em] ml-0.5 bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] bg-clip-text text-transparent"
            style={{ 
              filter: isDark ? 'drop-shadow(0 0 10px rgba(56,189,248,0.4))' : 'none'
            }}
          >
            Xcel
          </span>
        </span>
      )}
    </div>
  );
};
