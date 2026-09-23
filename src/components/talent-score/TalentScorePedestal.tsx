/**
 * TalentScore 3D Cyber Podium / Pedestal
 * Precision 3D cylindrical stage matching the master ChatGPT design.
 * Features:
 * - Concentric glowing cyan neon rings on top metallic surface
 * - 3D curved front cylinder wall with metallic lighting highlights
 * - Embossed/engraved glowing "LEARN | GROW | EARN | ACHIEVE" motto
 * - Soft ambient cyan reflection on the floor
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
    <div className={cn('relative w-full max-w-[620px] sm:max-w-[680px] md:max-w-[720px] mx-auto select-none pointer-events-auto', className)}>
      {/* Soft Ambient Floor Reflection Glow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-8 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

      {/* 3D Cylindrical Vector Podium */}
      <svg
        viewBox="0 0 700 155"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
      >
        <defs>
          {/* Intense Neon Cyan Glow for Light Rings */}
          <filter id="neonCyanGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Text Engraving Glow */}
          <filter id="textNeonGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Top Surface Radial Metallic Gradient */}
          <radialGradient
            id="pedestalTopSurface"
            cx="50%"
            cy="45%"
            r="50%"
            fx="50%"
            fy="45%"
          >
            <stop offset="0%" stopColor="#1e345e" />
            <stop offset="45%" stopColor="#132444" />
            <stop offset="85%" stopColor="#0a152b" />
            <stop offset="100%" stopColor="#060e1e" />
          </radialGradient>

          {/* Cylindrical Front Wall Shading - 3D Curvature Highlight */}
          <linearGradient id="cylinderWallShading" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#071021" />
            <stop offset="15%" stopColor="#10203e" />
            <stop offset="35%" stopColor="#1b3461" />
            <stop offset="50%" stopColor="#24447d" />
            <stop offset="65%" stopColor="#1b3461" />
            <stop offset="85%" stopColor="#10203e" />
            <stop offset="100%" stopColor="#071021" />
          </linearGradient>

          {/* Top Rim Specular Highlight */}
          <linearGradient id="topRimSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
          </linearGradient>

          {/* Bottom Rim Ambient Line */}
          <linearGradient id="bottomRimAmbient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* ── 1. Front Cylindrical 3D Wall (Depth) ─────────────────────────── */}
        {/* Curved front panel extending from top ellipse (y=44) down to bottom ellipse (y=104) */}
        <path
          d="M 15 44 C 15 88, 685 88, 685 44 L 685 104 C 685 148, 15 148, 15 104 Z"
          fill="url(#cylinderWallShading)"
        />

        {/* Vertical divider shading lines on cylinder wall */}
        <line x1="205" y1="67" x2="205" y2="124" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="335" y1="71" x2="335" y2="128" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="465" y1="71" x2="465" y2="128" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />

        {/* Bottom Rim Ambient Highlight Line */}
        <path
          d="M 15 104 C 15 148, 685 148, 685 104"
          fill="none"
          stroke="url(#bottomRimAmbient)"
          strokeWidth="1.5"
        />

        {/* ── 2. Top Metallic Surface (Perspective Disc) ───────────────────── */}
        <ellipse
          cx="350"
          cy="44"
          rx="335"
          ry="40"
          fill="url(#pedestalTopSurface)"
          stroke="#0c1d3b"
          strokeWidth="2"
        />

        {/* Top Rim Specular Highlight Curve */}
        <path
          d="M 15 44 C 15 88, 685 88, 685 44"
          fill="none"
          stroke="url(#topRimSpecular)"
          strokeWidth="2.5"
        />

        {/* ── 3. Concentric Recessed Neon Cyan Tracks / Light Rings ─────────── */}
        {/* Outer Glowing Neon Ring */}
        <ellipse
          cx="350"
          cy="44"
          rx="300"
          ry="33"
          fill="none"
          stroke="#00f2ff"
          strokeWidth="2.5"
          filter="url(#neonCyanGlow)"
          opacity="0.95"
        />

        {/* Inner Glowing Neon Ring (Directly framing the card base) */}
        <ellipse
          cx="350"
          cy="44"
          rx="250"
          ry="26"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          filter="url(#neonCyanGlow)"
          opacity="0.85"
        />

        {/* Innermost Core Ambient Ring */}
        <ellipse
          cx="350"
          cy="44"
          rx="180"
          ry="18"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* ── 4. Embossed / Engraved Glowing Motto on Cylinder Wall ─────────── */}
        {/* LEARN */}
        <g
          className="cursor-pointer group"
          onClick={() => onMottoClick?.('LEARN')}
        >
          <text
            x="145"
            y="104"
            textAnchor="middle"
            fill="#67e8f9"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="5"
            filter="url(#textNeonGlow)"
            className="transition-all hover:fill-white"
          >
            LEARN
          </text>
        </g>

        {/* Divider 1 */}
        <text
          x="215"
          y="104"
          textAnchor="middle"
          fill="#38bdf8"
          fillOpacity="0.75"
          fontFamily="system-ui, sans-serif"
          fontWeight="400"
          fontSize="16"
        >
          |
        </text>

        {/* GROW */}
        <g
          className="cursor-pointer group"
          onClick={() => onMottoClick?.('GROW')}
        >
          <text
            x="285"
            y="107"
            textAnchor="middle"
            fill="#67e8f9"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="5"
            filter="url(#textNeonGlow)"
            className="transition-all hover:fill-white"
          >
            GROW
          </text>
        </g>

        {/* Divider 2 */}
        <text
          x="355"
          y="107"
          textAnchor="middle"
          fill="#38bdf8"
          fillOpacity="0.75"
          fontFamily="system-ui, sans-serif"
          fontWeight="400"
          fontSize="16"
        >
          |
        </text>

        {/* EARN */}
        <g
          className="cursor-pointer group"
          onClick={() => onMottoClick?.('EARN')}
        >
          <text
            x="425"
            y="107"
            textAnchor="middle"
            fill="#67e8f9"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="5"
            filter="url(#textNeonGlow)"
            className="transition-all hover:fill-white"
          >
            EARN
          </text>
        </g>

        {/* Divider 3 */}
        <text
          x="495"
          y="104"
          textAnchor="middle"
          fill="#38bdf8"
          fillOpacity="0.75"
          fontFamily="system-ui, sans-serif"
          fontWeight="400"
          fontSize="16"
        >
          |
        </text>

        {/* ACHIEVE */}
        <g
          className="cursor-pointer group"
          onClick={() => onMottoClick?.('ACHIEVE')}
        >
          <text
            x="575"
            y="104"
            textAnchor="middle"
            fill="#67e8f9"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="5"
            filter="url(#textNeonGlow)"
            className="transition-all hover:fill-white"
          >
            ACHIEVE
          </text>
        </g>
      </svg>
    </div>
  );
};

export default TalentScorePedestal;
