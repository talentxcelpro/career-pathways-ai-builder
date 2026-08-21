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
    <div className={`flex items-center gap-2 select-none group ${className}`}>
      {/* Premium Vector Emblem matching official brand asset */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]"
        >
          {/* Circular outer gauge arc */}
          <path
            d="M 17 28 A 12 12 0 1 1 28 17"
            stroke={isDark ? "#FFFFFF" : "#0F172A"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Electric Blue dynamic needle */}
          <path
            d="M 12 20 L 22 10"
            stroke="#38BDF8"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* Center pivot dot */}
          <circle
            cx="12"
            cy="20"
            r="1.8"
            fill="#38BDF8"
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
            className="font-black tracking-[-0.02em] ml-0.5" 
            style={{ 
              color: '#38BDF8',
              textShadow: isDark ? '0 0 12px rgba(56,189,248,0.35)' : 'none'
            }}
          >
            Xcel
          </span>
        </span>
      )}
    </div>
  );
};
