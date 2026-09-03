import React, { useState, useMemo } from 'react';
import { Camera, Plus, Building2 } from 'lucide-react';
import { getCompanyLogoCandidates } from '@/services/companyLogoService';
import { CompanyLogoPromptModal } from './CompanyLogoPromptModal';

interface CompanyLogoSlotProps {
  companyId: string;
  companyName: string;
  websiteUrl?: string;
  logoUrl?: string;
  className?: string;
  onLogoUpdated?: (newUrl: string) => void;
}

export const CompanyLogoSlot: React.FC<CompanyLogoSlotProps> = ({
  companyId,
  companyName,
  websiteUrl,
  logoUrl,
  className = '',
  onLogoUpdated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasAllFailed, setHasAllFailed] = useState(false);
  const [activeLogoUrl, setActiveLogoUrl] = useState<string | undefined>(logoUrl);

  // Compute all fallback logo candidates from Google and DuckDuckGo
  const candidates = useMemo(() => {
    return getCompanyLogoCandidates(companyName, websiteUrl, activeLogoUrl);
  }, [companyName, websiteUrl, activeLogoUrl]);

  // Compute company initials
  const initials = useMemo(() => {
    return companyName
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [companyName]);

  const currentCandidate = candidates[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasAllFailed(true);
    }
  };

  const handleLogoSaved = (newUrl: string) => {
    setActiveLogoUrl(newUrl);
    setHasAllFailed(false);
    setCandidateIndex(0);
    if (onLogoUpdated) onLogoUpdated(newUrl);
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`relative group cursor-pointer w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border-2 border-white shadow-md p-1.5 flex items-center justify-center overflow-hidden shrink-0 transition-transform active:scale-95 ${className}`}
        title={`Click to change or fetch logo for ${companyName}`}
      >
        {!hasAllFailed && currentCandidate ? (
          <img
            key={currentCandidate}
            src={currentCandidate}
            alt={companyName}
            className="w-full h-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          /* Prompt Fallback with initials when logo is missing or couldn't be fetched */
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white">
            <span className="text-xs font-black tracking-wider leading-none">
              {initials || <Building2 className="h-4 w-4" />}
            </span>
          </div>
        )}

        {/* Hover / Missing Prompt Overlay */}
        <div className={`absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center text-white transition-opacity ${
          hasAllFailed ? 'opacity-90 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {hasAllFailed ? (
            <div className="flex flex-col items-center">
              <Plus className="h-3.5 w-3.5 text-blue-300 stroke-[3]" />
              <span className="text-[8px] font-extrabold text-blue-200 uppercase tracking-tighter">Add</span>
            </div>
          ) : (
            <Camera className="h-3.5 w-3.5 text-white/90" />
          )}
        </div>
      </div>

      {/* Interactive Modal prompting user to fetch from Google or upload */}
      <CompanyLogoPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={companyId}
        companyName={companyName}
        websiteUrl={websiteUrl}
        currentLogoUrl={activeLogoUrl || currentCandidate}
        onLogoSaved={handleLogoSaved}
      />
    </>
  );
};
