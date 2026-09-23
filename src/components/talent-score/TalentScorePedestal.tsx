/**
 * TalentScore 3D Cyber Turntable Stage / Pedestal
 * 1:1 Pixel-Perfect Recreation of Image 2 (ChatGPT Video Design):
 * - Concentric glowing electric cyan neon rings on top metallic surface
 * - 3D curved front cylinder wall with metallic reflections
 * - Curved engraved glowing "LEARN | GROW | EARN | ACHIEVE" text with specular glow
 * - Brushed chrome base collar resting on bright studio floor with ambient cyan reflection
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TalentScorePedestalProps {
  className?: string;
  onMottoClick?: (word: 'LEARN' | 'GROW' | 'EARN' | 'ACHIEVE') => void;
}

export const TalentScorePedestal: React.FC<TalentScorePedestalProps> = ({
  className,
  onMottoClick,
}) => {
  return (
    <div className={cn('relative w-full max-w-[680px] sm:max-w-[720px] md:max-w-[760px] mx-auto select-none pointer-events-auto', className)}>
      {/* Soft Ambient Floor Reflection Glow onto Studio White Floor */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-cyan-400/35 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[75%] h-8 bg-blue-500/25 rounded-full blur-xl pointer-events-none" />

      {/* 3D Cylindrical Vector Turntable Stage */}
      <svg
        viewBox="0 0 800 155"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
      >
        <defs>
          {/* Intense Electric Cyan Neon Glow for Light Rings */}
          <filter id="neonCyanGlowTarget" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Text Engraving Glow Filter */}
          <filter id="textGlowTarget" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Floor Reflection Blur */}
          <filter id="floorReflectionBlur" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>

          {/* Top Surface Radial Metallic Gradient */}
          <radialGradient
            id="turntableTopSurface"
            cx="50%"
            cy="42%"
            r="50%"
            fx="50%"
            fy="42%"
          >
            <stop offset="0%" stopColor="#1e345e" />
            <stop offset="40%" stopColor="#132444" />
            <stop offset="80%" stopColor="#0b162d" />
            <stop offset="100%" stopColor="#060e1d" />
          </radialGradient>

          {/* Cylindrical Front Wall Shading - 3D Curvature Highlight */}
          <linearGradient id="cylinderWallShadingTarget" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#081022" />
            <stop offset="15%" stopColor="#0f1f3d" />
            <stop offset="35%" stopColor="#1b335e" />
            <stop offset="50%" stopColor="#25477d" />
            <stop offset="65%" stopColor="#1b335e" />
            <stop offset="85%" stopColor="#0f1f3d" />
            <stop offset="100%" stopColor="#081022" />
          </linearGradient>

          {/* Top Rim Specular Cyan-White Highlight */}
          <linearGradient id="topRimSpecularTarget" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          {/* Brushed Chrome Base Collar Gradient */}
          <linearGradient id="chromeBaseCollar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="20%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Text Curvature Guide Path */}
          <path
            id="textCurvaturePath"
            d="M 60 76 C 240 120, 560 120, 740 76"
            fill="none"
          />
        </defs>

        {/* ── 0. Soft Floor Cyan Ambient Glow (SVG) ─────────────────────────── */}
        <ellipse cx="400" cy="120" rx="350" ry="18" fill="#00e5ff" opacity="0.35" filter="url(#floorReflectionBlur)" />
        <ellipse cx="400" cy="116" rx="300" ry="14" fill="#38bdf8" opacity="0.4" filter="url(#floorReflectionBlur)" />

        {/* ── 1. Chrome Base Collar Ring Flat on Studio Floor ───────────────── */}
        <path
          d="M 25 68 C 25 118, 775 118, 775 68 L 775 80 C 775 130, 25 130, 25 80 Z"
          fill="url(#chromeBaseCollar)"
        />

        {/* ── 2. Front Cylindrical 3D Metallic Wall (Depth ~40px) ───────────── */}
        <path
          d="M 35 44 C 35 92, 765 92, 765 44 L 765 84 C 765 132, 35 132, 35 84 Z"
          fill="url(#cylinderWallShadingTarget)"
        />

        {/* Vertical divider bevel lines along cylinder curvature */}
        <line x1="230" y1="67" x2="230" y2="106" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="385" y1="71" x2="385" y2="110" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="535" y1="71" x2="535" y2="110" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />

        {/* Bottom Rim Ambient Line */}
        <path
          d="M 35 84 C 35 132, 765 132, 765 84"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* ── 3. Top Metallic Turntable Surface (Perspective Disc) ──────────── */}
        <ellipse
          cx="400"
          cy="44"
          rx="365"
          ry="38"
          fill="url(#turntableTopSurface)"
          stroke="#0b162d"
          strokeWidth="2"
        />

        {/* Top Rim Specular Curved Bevel Highlight */}
        <path
          d="M 35 44 C 35 92, 765 92, 765 44"
          fill="none"
          stroke="url(#topRimSpecularTarget)"
          strokeWidth="2.5"
        />

        {/* ── 4. Concentric Glowing Neon Cyan Light Rings ───────────────────── */}
        {/* Outer Electric Neon Cyan Ring */}
        <ellipse
          cx="400"
          cy="44"
          rx="330"
          ry="32"
          fill="none"
          stroke="#00f5ff"
          strokeWidth="3"
          filter="url(#neonCyanGlowTarget)"
          opacity="0.95"
        />

        {/* Inner Glowing Cyan Ring directly framing the card base */}
        <ellipse
          cx="400"
          cy="44"
          rx="275"
          ry="25"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          filter="url(#neonCyanGlowTarget)"
          opacity="0.9"
        />

        {/* Core Soft Ambient Disc under card */}
        <ellipse
          cx="400"
          cy="44"
          rx="200"
          ry="17"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* ── 5. Curved Engraved Motto Text along Cylinder Wall ──────────────── */}
        <text
          filter="url(#textGlowTarget)"
          className="cursor-pointer"
        >
          <textPath
            href="#textCurvaturePath"
            startOffset="50%"
            textAnchor="middle"
            fill="#67e8f9"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="16.5"
            letterSpacing="7"
          >
            LEARN &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; GROW &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; EARN &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ACHIEVE
          </textPath>
        </text>

        {/* ── 6. Clickable Overlay Regions for Interactivity ─────────────────── */}
        <rect
          x="120"
          y="72"
          width="110"
          height="38"
          fill="transparent"
          className="cursor-pointer"
          onClick={() => onMottoClick?.('LEARN')}
        >
          <title>Click to view Learning Plan</title>
        </rect>

        <rect
          x="270"
          y="80"
          width="110"
          height="38"
          fill="transparent"
          className="cursor-pointer"
          onClick={() => onMottoClick?.('GROW')}
        >
          <title>Click to view Growth Delta</title>
        </rect>

        <rect
          x="425"
          y="80"
          width="110"
          height="38"
          fill="transparent"
          className="cursor-pointer"
          onClick={() => onMottoClick?.('EARN')}
        >
          <title>Click to view Opportunities</title>
        </rect>

        <rect
          x="575"
          y="72"
          width="120"
          height="38"
          fill="transparent"
          className="cursor-pointer"
          onClick={() => onMottoClick?.('ACHIEVE')}
        >
          <title>Click to view Badges</title>
        </rect>
      </svg>
    </div>
  );
};

export default TalentScorePedestal;
