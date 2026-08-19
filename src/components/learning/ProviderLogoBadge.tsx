import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ProviderLogoBadgeProps {
  name: string;
  logoUrl?: string;
  className?: string;
}

export const ProviderLogoBadge: React.FC<ProviderLogoBadgeProps> = ({ name, logoUrl, className = "w-12 h-12" }) => {
  const [imgError, setImgError] = useState(false);

  // Helper to generate crisp brand initials badges
  const getBrandInitialsBadge = () => {
    const n = (name || '').toLowerCase();
    
    let initials = 'LP';
    let bgGradient = 'bg-slate-800 text-white';

    if (n.includes('microsoft')) {
      initials = 'MS';
      bgGradient = 'bg-blue-600 text-white font-extrabold';
    } else if (n.includes('mit')) {
      initials = 'MIT';
      bgGradient = 'bg-rose-900 text-white font-extrabold';
    } else if (n.includes('ibm')) {
      initials = 'IBM';
      bgGradient = 'bg-blue-950 text-white font-extrabold';
    } else if (n.includes('freecodecamp')) {
      initials = 'fCC';
      bgGradient = 'bg-emerald-900 text-white font-extrabold';
    } else if (n.includes('aws') || n.includes('amazon')) {
      initials = 'AWS';
      bgGradient = 'bg-amber-500 text-slate-950 font-extrabold';
    } else if (n.includes('google')) {
      initials = 'G';
      bgGradient = 'bg-blue-500 text-white font-extrabold';
    } else if (n.includes('cisco')) {
      initials = 'CSCO';
      bgGradient = 'bg-sky-700 text-white font-extrabold';
    } else if (n.includes('salesforce')) {
      initials = 'SF';
      bgGradient = 'bg-cyan-600 text-white font-extrabold';
    } else if (n.includes('harvard')) {
      initials = 'HU';
      bgGradient = 'bg-red-900 text-white font-extrabold';
    } else if (n.includes('stanford')) {
      initials = 'SU';
      bgGradient = 'bg-cardinal text-red-900 bg-red-100 font-extrabold';
    } else if (n.includes('nvidia')) {
      initials = 'NV';
      bgGradient = 'bg-emerald-700 text-white font-extrabold';
    } else if (n.includes('hubspot')) {
      initials = 'HS';
      bgGradient = 'bg-orange-600 text-white font-extrabold';
    } else if (n.includes('oracle')) {
      initials = 'ORCL';
      bgGradient = 'bg-red-700 text-white font-extrabold';
    } else if (n.includes('sap')) {
      initials = 'SAP';
      bgGradient = 'bg-blue-800 text-white font-extrabold';
    } else if (n.includes('unity')) {
      initials = 'UTY';
      bgGradient = 'bg-slate-900 text-white font-extrabold';
    } else if (n.includes('meta') || n.includes('facebook')) {
      initials = 'META';
      bgGradient = 'bg-blue-600 text-white font-extrabold';
    } else if (n.includes('khan')) {
      initials = 'KA';
      bgGradient = 'bg-emerald-600 text-white font-extrabold';
    } else if (n.includes('coursera')) {
      initials = 'CRA';
      bgGradient = 'bg-blue-700 text-white font-extrabold';
    } else if (n.includes('edx')) {
      initials = 'edX';
      bgGradient = 'bg-rose-800 text-white font-extrabold';
    } else if (n.includes('udemy')) {
      initials = 'UDM';
      bgGradient = 'bg-purple-800 text-white font-extrabold';
    } else if (n.includes('linkedin')) {
      initials = 'in';
      bgGradient = 'bg-blue-700 text-white font-extrabold';
    } else {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        initials = (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length === 1 && words[0].length >= 2) {
        initials = words[0].substring(0, 2).toUpperCase();
      }
    }

    return (
      <div className={`${className} rounded-2xl ${bgGradient} flex items-center justify-center text-xs tracking-wider shadow-xs shrink-0 select-none`}>
        {initials}
      </div>
    );
  };

  if (imgError || !logoUrl) {
    return getBrandInitialsBadge();
  }

  return (
    <div className={`${className} rounded-2xl bg-white dark:bg-muted p-1.5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-border shrink-0 shadow-2xs`}>
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};
