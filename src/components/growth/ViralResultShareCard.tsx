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
    <Card className={`overflow-hidden border-2 border-indigo-200/80 bg-white shadow-sm rounded-2xl ${className}`}>
      {/* Decorative gradient header strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-0.5 flex items-center gap-1 font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> {badgeText}
          </Badge>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            TalentXcel Live Score
          </span>
        </div>
        <CardTitle className="text-base sm:text-lg font-black text-slate-900 mt-1">
          {headline}
        </CardTitle>
        <CardDescription className="text-xs text-slate-600">
          {subheadline}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visual Score Callout */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
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
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Share Your Achievement:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('whatsapp')}
              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 text-xs font-semibold h-8"
            >
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('linkedin')}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 text-xs font-semibold h-8"
            >
              LinkedIn
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShareClick('x')}
              className="bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 text-xs font-semibold h-8"
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
