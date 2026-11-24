import React, { useRef } from 'react';
import { Download, Share2, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTier, TalentScoreTier } from '@/components/talent-score/TalentScoreRing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { trackFunnelEvent } from '@/services/telemetry/funnelTracker';

interface TalentScoreShareCardProps {
  score: number;
  fullName: string;
  title?: string;
  company?: string;
}

const TIER_THEMES: Record<TalentScoreTier, { bg: string; text: string; glow: string; label: string; icon: string }> = {
  emerging: { bg: 'from-slate-900 to-slate-800', text: 'text-slate-300', glow: 'shadow-slate-500/20', label: 'Emerging', icon: '🌱' },
  rising:   { bg: 'from-blue-950 to-blue-900',   text: 'text-blue-300',  glow: 'shadow-blue-500/30',  label: 'Rising',   icon: '📈' },
  pro:      { bg: 'from-violet-950 to-violet-900',text: 'text-violet-300',glow: 'shadow-violet-500/30',label: 'Pro',      icon: '⚡' },
  elite:    { bg: 'from-amber-950 to-amber-900', text: 'text-amber-300', glow: 'shadow-amber-500/30', label: 'Elite',    icon: '🏆' },
  legend:   { bg: 'from-orange-950 to-red-950',  text: 'text-orange-300',glow: 'shadow-orange-500/40',label: 'Legend',   icon: '👑' },
};

export const TalentScoreShareCard: React.FC<TalentScoreShareCardProps> = ({
  score,
  fullName,
  title,
  company,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = getTier(score);
  const theme = TIER_THEMES[tier];
  const { user } = useAuth();

  const refCode = user?.id ? 'TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : 'SCORE';
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/talent-score?ref=${refCode}&utm_source=social_share&utm_medium=talent_score`
    : 'https://talentxcel.in/talent-score';
  const shareTitle = `My TalentScore: ${score}/1000 (${theme.label} Tier) | TalentXcel`;
  const shareText = `I benchmarked my career readiness with TalentScore on TalentXcel and achieved ${score}/1000 (${theme.label} Tier). Check your score and claim your Career Passport: ${shareUrl}`;

  const generateCardDataUrl = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.warn('html2canvas render error, falling back to text copy:', err);
      return null;
    }
  };

  const handleDownload = async () => {
    trackFunnelEvent('talent_score_share', { score, action: 'download_image' });
    try {
      toast.info('Generating image...');
      const dataUrl = await generateCardDataUrl();
      if (!dataUrl) {
        toast.error('Image export not supported on this device');
        return;
      }
      const link = document.createElement('a');
      link.download = `talent-score-${fullName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate image', err);
      toast.error('Failed to generate image');
    }
  };

  const handleShare = async () => {
    trackFunnelEvent('talent_score_share', { score, tier: theme.label });
    if (!cardRef.current) return;
    try {
      toast.info('Preparing share...');
      const dataUrl = await generateCardDataUrl();
      if (dataUrl) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'talent-score.png', { type: blob.type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              files: [file],
            });
            toast.success('Shared successfully!');
            return;
          }
        } catch {
          // File sharing fallback
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Share text and link copied to clipboard! Paste directly into LinkedIn, X, or WhatsApp.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share', err);
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success('Share link copied to clipboard!');
        } catch {
          toast.error('Failed to share card');
        }
      }
    }
  };

  const handleCopyLink = async () => {
    trackFunnelEvent('talent_score_share', { score, action: 'copy_link' });
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('TalentScore link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual Share Card */}
      <div
        ref={cardRef}
        className={cn(
          'w-80 rounded-2xl p-6 text-white bg-gradient-to-br shadow-2xl relative overflow-hidden border border-white/10',
          theme.bg,
          theme.glow
        )}
      >
        {/* Background glow decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{theme.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">TalentScore</span>
          </div>
          <span className={cn('text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10', theme.text)}>
            {theme.label}
          </span>
        </div>

        {/* Score Display */}
        <div className="text-center my-4">
          <div className="text-6xl font-black tracking-tight text-white">{score}</div>
          <div className="text-xs text-white/50 mt-1">out of 1000</div>
        </div>

        {/* User Info */}
        <div className="border-t border-white/10 pt-4 mt-6 text-center">
          <p className="font-semibold text-sm text-white truncate">{fullName}</p>
          {title && <p className="text-xs text-white/60 truncate mt-0.5">{title}</p>}
          {company && <p className="text-xs text-white/40 truncate">{company}</p>}
        </div>

        {/* Footer branding */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
          <span>talentxcel.in/talent-score</span>
          <span className="flex items-center gap-1 font-semibold text-white/60">
            <Sparkles className="w-3 h-3 text-cyan-400" /> TalentXcel
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          onClick={handleShare}
          className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs"
        >
          <Share2 className="w-4 h-4" /> Share Score
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
        >
          <Download className="w-4 h-4" /> Save
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
        >
          <Copy className="w-4 h-4" /> Link
        </Button>
      </div>
    </div>
  );
};

export default TalentScoreShareCard;
