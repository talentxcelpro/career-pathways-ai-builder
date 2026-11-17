// src/components/jobs/WhatsAppChannelCard.tsx
// TalentXcel Zero-Cost WhatsApp Hiring Alerts Channel Card
// Follow official TalentXcel Jobs WhatsApp Channel without passwords, registration, or cost.

import React from 'react';
import { MessageCircle, ShieldCheck, Zap, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

interface WhatsAppChannelCardProps {
  locationName?: string;
  roleName?: string;
  className?: string;
}

export const WhatsAppChannelCard: React.FC<WhatsAppChannelCardProps> = ({
  locationName,
  roleName,
  className = '',
}) => {
  const channelUrl = (import.meta.env.VITE_WHATSAPP_CHANNEL_URL as string) || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';

  const handleClick = () => {
    try {
      conversionTelemetry.track('whatsapp_channel_click', {
        location: locationName || 'All India',
        role: roleName || 'All Roles',
        channelUrl,
      });
    } catch {
      // safe fallback
    }
  };

  const dynamicTitle = locationName
    ? `Never Miss a Hiring Vacancy in ${locationName}`
    : 'Never Miss Your Next Opportunity';

  return (
    <section className={`rounded-2xl border-2 border-emerald-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all text-left space-y-4 ${className}`}>
      {/* Top Header Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 fill-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">TalentXcel Jobs</h3>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-semibold py-0 px-1.5 rounded-full">
                Official Channel
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">Free Verified Job Alerts on WhatsApp</p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-200 px-2.5 py-1 rounded-full">
          2,700+ Active Roles
        </span>
      </div>

      {/* Main Copy */}
      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
          {dynamicTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Follow our official WhatsApp Channel for daily verified job postings, tech openings, fresher roles, and direct ATS application links across {locationName || 'India'}.
        </p>
      </div>

      {/* Trust & Zero-Cost Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 p-2 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>No phone number shared</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 p-2 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Direct ATS links</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 p-2 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>100% Free forever</span>
        </div>
      </div>

      {/* Follow CTA Button */}
      <div className="pt-2">
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Follow TalentXcel Jobs on WhatsApp →</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Zero registration or password required. Unfollow anytime directly inside WhatsApp.
        </p>
      </div>
    </section>
  );
};

export default WhatsAppChannelCard;
