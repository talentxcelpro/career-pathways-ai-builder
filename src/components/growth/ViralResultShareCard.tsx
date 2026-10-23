import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Check, Copy, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

interface ViralResultShareCardProps {
  headline: string;
  subheadline?: string;
  metricValue: string | number;
  metricLabel: string;
  badgeText?: string;
  canonicalPath?: string;
  category?: 'job_match' | 'college_roi' | 'salary_percentile' | 'ats_score';
  className?: string;
}

export const ViralResultShareCard: React.FC<ViralResultShareCardProps> = ({
  headline,
  subheadline = 'Verified TalentXcel Assessment',
  metricValue,
  metricLabel,
  badgeText = 'Top 10% Tier',
  canonicalPath = typeof window !== 'undefined' ? window.location.pathname : '/',
  category = 'job_match',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const baseUrl = 'https://talentxcel.in';
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;

  const buildShareUrl = (platform: string) => {
    const shareUrl = new URL(`${baseUrl}${cleanPath}`);
    shareUrl.searchParams.set('utm_source', platform);
    shareUrl.searchParams.set('utm_medium', 'viral_share_card');
    shareUrl.searchParams.set('utm_campaign', `user_result_${category}`);
    return shareUrl.toString();
  };

  const shareText = `I just benchmarked with TalentXcel: ${headline} (${metricValue} ${metricLabel}). Check your verified profile score:`;

  const handleShareClick = (platform: 'whatsapp' | 'linkedin' | 'x' | 'clipboard') => {
    const url = buildShareUrl(platform);

    conversionTelemetry.track('viral_share_clicked', {
      platform,
      category,
      metricValue: String(metricValue),
      metricLabel,
      targetPath: cleanPath
    });

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      toast.success('Shareable result link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Card className={`overflow-hidden border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 shadow-xl ${className}`}>
      {/* Decorative gradient header strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs px-2.5 py-0.5 flex items-center gap-1 font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> {badgeText}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            TalentXcel Live Score
          </span>
        </div>
        <CardTitle className="text-base sm:text-lg font-black text-white mt-1">
          {headline}
        </CardTitle>
        <CardDescription className="text-xs text-slate-300">
          {subheadline}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visual Score Callout */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              {metricValue}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {metricLabel}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> Verified Result
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Ready to showcase
            </div>
          </div>
        </div>

        {/* 1-Click Viral Distribution Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Share Your Achievement:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('whatsapp')}
              className="bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/40 text-emerald-300 text-xs font-semibold h-8"
            >
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('linkedin')}
              className="bg-blue-950/30 hover:bg-blue-900/50 border-blue-800/40 text-blue-300 text-xs font-semibold h-8"
            >
              LinkedIn
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('x')}
              className="bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 text-xs font-semibold h-8"
            >
              X / Twitter
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleShareClick('clipboard')}
              className="text-xs font-semibold h-8 gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViralResultShareCard;
