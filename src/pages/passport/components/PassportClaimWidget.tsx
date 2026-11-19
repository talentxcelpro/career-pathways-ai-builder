import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackFunnelEvent } from '@/services/telemetry/funnelTracker';
import { toast } from 'sonner';

interface PassportClaimWidgetProps {
  className?: string;
  variant?: 'card' | 'inline';
}

export const PassportClaimWidget: React.FC<PassportClaimWidgetProps> = ({ 
  className = '',
  variant = 'card'
}) => {
  const [handle, setHandle] = useState('');
  const navigate = useNavigate();

  const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanHandle) {
      toast.error('Please enter a handle name (e.g. john-doe)');
      return;
    }
    trackFunnelEvent('passport_claimed', { requested_handle: cleanHandle, source: 'claim_widget' });
    navigate(`/passport?claim=${encodeURIComponent(cleanHandle)}`);
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row items-center gap-2 ${className}`}>
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono select-none">
            talentxcel.in/u/
          </span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourname"
            className="w-full pl-36 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-blue-500 outline-none transition"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
        >
          Claim Handle &rarr;
        </Button>
      </form>
    );
  }

  return (
    <div className={`rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-800/40 p-6 sm:p-8 text-center space-y-4 shadow-xl ${className}`}>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        Zero Cost · High-Intent Professional Identity
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white">
        Claim Your Verified Career Passport Vanity Handle
      </h3>

      <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
        Establish your verified career identity (<code className="text-blue-300 font-mono">talentxcel.in/u/yourname</code>). 
        Showcase verified ATS scores, collect colleague endorsements, and receive direct recruiter inquiries.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono select-none">
            talentxcel.in/u/
          </span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourname"
            className="w-full pl-36 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-blue-500 outline-none transition"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
        >
          Claim Free &rarr;
        </Button>
      </form>

      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-400" /> Instant Setup
        </span>
        <span>•</span>
        <span>Includes ATS Badge</span>
        <span>•</span>
        <span>Peer Endorsements Enabled</span>
      </div>
    </div>
  );
};

export default PassportClaimWidget;
