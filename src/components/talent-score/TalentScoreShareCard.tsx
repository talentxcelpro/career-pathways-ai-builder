import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTier, TalentScoreTier } from '@/components/talent-score/TalentScoreRing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      toast.info('Generating image...');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
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
    if (!cardRef.current) return;
    try {
      toast.info('Preparing share...');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'talent-score.png', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My TalentScore',
          text: `I just reached the ${theme.label} Tier on TalentXcel TalentXcel Core!`,
          files: [file],
        });
      } else {
        toast.error('Native sharing not supported on this device. Please download instead.');
      }
    } catch (err) {
      console.error('Failed to share', err);
      toast.error('Failed to share image');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The actual card that gets captured */}
      <div
        ref={cardRef}
        className={cn(
          'w-[400px] h-[500px] rounded-[2.5rem] p-8 flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-br',
          theme.bg
        )}
      >
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, white, transparent 70%)' }} />
        
        {/* Header */}
        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("h-5 w-5", theme.text)} />
            <span className={cn("font-bold tracking-widest uppercase text-xs", theme.text)}>TalentXcel</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <span>{theme.icon}</span>
            <span className="text-white text-xs font-bold uppercase tracking-wider">{theme.label} Tier</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center mt-4">
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">CareerIntelligence Score</p>
          <div className={cn("text-[100px] leading-none font-black text-white drop-shadow-2xl mb-2", theme.glow)}>
            {score}
          </div>
          <h2 className="text-2xl font-black text-white mt-6">{fullName}</h2>
          {title && (
            <p className="text-white/80 text-base mt-2">
              {title} {company ? `at ${company}` : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-center pt-8 border-t border-white/10 relative z-10">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
            Build your TalentXcel Core at TalentXcel.in
          </p>
        </div>
      </div>

      {/* Action Buttons (Not captured in image) */}
      <div className="flex items-center gap-3 w-[400px]">
        <Button onClick={handleDownload} className="flex-1 rounded-2xl h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold">
          <Download className="h-4 w-4 mr-2" />
          Download Image
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex-1 rounded-2xl h-12 font-bold border-slate-200">
          <Share2 className="h-4 w-4 mr-2" />
          Share to Socials
        </Button>
      </div>
    </div>
  );
};


