// src/components/claim1/ShareRankModal.tsx
// 1-Click Social Flex Card Generator for Twitter/X and LinkedIn virality

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Twitter, Linkedin, Copy, Check, Sparkles, Trophy, ExternalLink, Flame } from 'lucide-react';
import type { Claim1Entity } from '@/types/claim1';
import { toast } from 'sonner';

interface ShareRankModalProps {
  entity: Claim1Entity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRank?: number | null;
  scopeName?: string;
}

export function ShareRankModal({
  entity,
  open,
  onOpenChange,
  currentRank = 1,
  scopeName = 'Global AI Products',
}: ShareRankModalProps) {
  const [copied, setCopied] = useState(false);
  const isRank1 = currentRank === 1;
  const isFounding = entity.is_founding_100 || entity.founding_fee_locked;
  const profileUrl = `https://talentxcel.in/company/${entity.slug}`;

  // Viral share copy tailored to rank and status
  const tweetText = isRank1
    ? `🔥 We just claimed the #1 Spot on @TalentXcel's ${scopeName} Leaderboard!\n\nThink your AI tool can beat ${entity.name}? Challenge our rank or explore the board: ${profileUrl}`
    : isFounding
    ? `🚀 ${entity.name} is officially in the Founding 100 on @TalentXcel's ${scopeName} Leaderboard!\n\nCheck out our live ranking and track the AI race: ${profileUrl}`
    : `🏆 Track ${entity.name}'s live rank on @TalentXcel's ${scopeName} Leaderboard: ${profileUrl}`;

  const linkedInText = `Excited to announce that ${entity.name} is now live on the @TalentXcel Global AI Product Leaderboard! 🚀\n\nTrack our live ranking, product milestones, and challenge our position: ${profileUrl}\n\n#AI #TechLeaderboard #Startups #Innovation #TalentXcel`;

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    toast.success('Flex copy copied to clipboard! Paste anywhere.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Flame className="w-5 h-5 text-orange-500" /> Share Your Rank
          </DialogTitle>
          <DialogDescription>
            Flex your ranking to your followers, investors, and community to spark challenge bids and drive social proof.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Visual Social Card Preview */}
          <div className="p-5 rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/20">
                  {entity.logo_url ? (
                    <img src={entity.logo_url} alt={entity.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-white text-lg">{entity.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{entity.name}</h4>
                  <p className="text-[11px] text-slate-400">{scopeName}</p>
                </div>
              </div>

              <Badge className="bg-amber-500 text-black font-bold text-xs px-2.5 py-0.5">
                {isRank1 ? '🥇 #1 RANK' : `RANK #${currentRank || '—'}`}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic bg-white/5 p-3 rounded-lg border border-white/10">
              "{tweetText.replace(/\n\n/g, ' ')}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
              <span>talentxcel.in/rankings</span>
              <span className="font-mono text-primary-foreground">⚡ Live Bidding Active</span>
            </div>
          </div>

          {/* 1-Click Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleShareTwitter}
              className="w-full gap-2 bg-black hover:bg-black/90 text-white font-semibold"
            >
              <Twitter className="w-4 h-4" /> Share to 𝕏 (Twitter)
            </Button>

            <Button
              onClick={handleShareLinkedIn}
              variant="outline"
              className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold"
            >
              <Linkedin className="w-4 h-4" /> Share on LinkedIn
            </Button>

            <Button
              onClick={handleCopyText}
              variant="ghost"
              className="w-full gap-2 text-xs text-muted-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Flex Text Copied!' : 'Copy Share Text & URL'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
