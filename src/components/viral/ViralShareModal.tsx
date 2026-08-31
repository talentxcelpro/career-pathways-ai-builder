// src/components/viral/ViralShareModal.tsx
// High-Converting Personalized Result Artifact & 1-Click Share Kit
// Supports: WhatsApp Contextual Share, Native WebShare API, LinkedIn Artifact Copy & Direct Referral Links

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Linkedin, 
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { GrowthEventTracker } from '@/lib/autonomous-os/growthEventTracker';

export interface ScorecardShareData {
  score: number;
  grade: string;
  roleTarget: string;
  keyStrengths: string[];
  topGaps: string[];
  referralToken: string;
}

interface ViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScorecardShareData;
}

export const ViralShareModal: React.FC<ViralShareModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [copied, setCopied] = useState(false);
  const [postCopied, setPostCopied] = useState(false);
  const tracker = GrowthEventTracker.getInstance();

  const shareUrl = `https://talentxcel.in/resume?ref=${data.referralToken}`;

  const whatsappMessage = `I just tested my resume on TalentXcel and scored ${data.score}/100 for ${data.roleTarget} roles. It caught 3 keyword & formatting gaps I didn't notice.\n\nCheck yours for free here:\n${shareUrl}`;

  const linkedInPostText = `I just audited my resume against enterprise ATS filters using TalentXcel and scored ${data.score}/100 (${data.grade} Grade) for ${data.roleTarget} roles! 🎯\n\nKey Insights:\n${data.topGaps.map(g => `• ${g}`).join('\n')}\n\nYou can run a free diagnostic on your resume here: ${shareUrl}\n\n#career #resumetips #techjobs #talentxcel #jobsearch`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    tracker.trackEvent('SHARE_COMPLETED_COPY', 'ATS_SCANNER', data.referralToken);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    tracker.trackEvent('SHARE_COMPLETED_WHATSAPP', 'ATS_SCANNER', data.referralToken);
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleLinkedInShare = () => {
    tracker.trackEvent('SHARE_COMPLETED_LINKEDIN', 'ATS_SCANNER', data.referralToken);
    navigator.clipboard.writeText(linkedInPostText);
    setPostCopied(true);
    toast.success('Post text copied! Opening LinkedIn...');
    setTimeout(() => {
      setPostCopied(false);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    }, 700);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TalentXcel ATS Scorecard: ${data.score}/100`,
          text: `I scored ${data.score}/100 on the TalentXcel ATS diagnostic for ${data.roleTarget}. Test yours free:`,
          url: shareUrl
        });
        tracker.trackEvent('SHARE_COMPLETED_NATIVE', 'ATS_SCANNER', data.referralToken);
        toast.success('Scorecard shared successfully!');
      } catch (err) {
        // User canceled or dismissed share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> Shareable Result Artifact
            </Badge>
            <span className="text-[11px] text-slate-400 font-medium">Ref: #{data.referralToken.slice(0, 8)}</span>
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
            Share Your ATS Scorecard
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Share your verified diagnostic with peers or challenge friends to test their score.
          </DialogDescription>
        </DialogHeader>

        {/* 1. VISUAL SCORECARD ARTIFACT */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-md space-y-3.5 border border-slate-700/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">TalentXcel ATS Diagnostic</p>
              <h4 className="text-sm font-bold text-white mt-0.5">{data.roleTarget}</h4>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400 leading-none">{data.score}<span className="text-xs text-slate-400 font-normal">/100</span></div>
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Grade {data.grade}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-700/60 text-xs">
            <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Key Improvement Areas:
            </p>
            {data.topGaps.slice(0, 2).map((gap, i) => (
              <p key={i} className="text-[11px] text-slate-300 pl-5">
                • {gap}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <ShieldCheck className="h-3 w-3 text-blue-400" /> Verified Algorithmic Score
            </span>
            <span className="font-mono text-blue-400">talentxcel.in</span>
          </div>
        </div>

        {/* 2. INSTANT SHARE CHANNELS */}
        <div className="space-y-2.5 pt-2">
          {/* WhatsApp Primary */}
          <Button 
            onClick={handleWhatsAppShare}
            className="w-full h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 rounded-xl"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            Share on WhatsApp
          </Button>

          {/* LinkedIn Post Copy */}
          <Button 
            variant="outline"
            onClick={handleLinkedInShare}
            className="w-full h-10 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 rounded-xl"
          >
            <Linkedin className="h-4 w-4 text-[#0A66C2] fill-current" />
            {postCopied ? 'Copied! Opening LinkedIn...' : 'Share on LinkedIn'}
          </Button>

          {/* Native Web Share & Copy Row */}
          <div className="grid grid-cols-2 gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button 
                variant="secondary"
                onClick={handleNativeShare}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl"
              >
                <Share2 className="h-3.5 w-3.5 text-blue-600" />
                Native Share
              </Button>
            )}
            <Button 
              variant="secondary"
              onClick={handleCopyLink}
              className={`h-9 text-xs font-bold gap-1.5 rounded-xl ${!('share' in (typeof navigator !== 'undefined' ? navigator : {})) ? 'col-span-2' : ''}`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied Link!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
