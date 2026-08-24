// src/components/claim1/EmbedBadgeModal.tsx
// Embeddable Live Badge Generator (Markdown & HTML snippets for founder websites and GitHub READMEs)

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
import { Copy, Check, Code, Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import type { Claim1Entity } from '@/types/claim1';
import { toast } from 'sonner';

interface EmbedBadgeModalProps {
  entity: Claim1Entity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRank?: number | null;
}

export function EmbedBadgeModal({ entity, open, onOpenChange, currentRank = 1 }: EmbedBadgeModalProps) {
  const [badgeType, setBadgeType] = useState<'rank' | 'founding' | 'verified'>('rank');
  const [copiedType, setCopiedType] = useState<'markdown' | 'html' | null>(null);

  const rankText = currentRank === 1 ? '🥇 #1 AI Product' : currentRank ? `Rank #${currentRank}` : 'Ranked Product';
  const targetUrl = `https://talentxcel.in/company/${entity.slug}`;

  // Generate SVG string representation
  const getBadgeSvgUrl = () => {
    let leftText = 'TalentXcel';
    let rightText = rankText;
    let rightColor = '%233b82f6'; // Blue

    if (badgeType === 'founding') {
      leftText = 'TalentXcel';
      rightText = 'Founding 100';
      rightColor = '%23f59e0b'; // Amber
    } else if (badgeType === 'verified') {
      leftText = 'TalentXcel';
      rightText = 'Verified Listing';
      rightColor = '%2310b981'; // Emerald
    }

    return `https://img.shields.io/badge/${leftText}-${encodeURIComponent(rightText)}-${rightColor.replace('%23', '')}?style=for-the-badge&logo=rocket&logoColor=white`;
  };

  const badgeImgSrc = getBadgeSvgUrl();
  const markdownSnippet = `[![${entity.name} on TalentXcel](${badgeImgSrc})](${targetUrl})`;
  const htmlSnippet = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImgSrc}" alt="${entity.name} on TalentXcel" /></a>`;

  const copyToClipboard = (text: string, type: 'markdown' | 'html') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`Copied ${type.toUpperCase()} snippet! Paste it on your site or README.`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Code className="w-5 h-5 text-primary" /> Embed Live Ranking Badge
          </DialogTitle>
          <DialogDescription>
            Embed dynamic live badges on your landing page, docs, or GitHub README to showcase your verified rank and earn referral traffic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Badge Style Selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Badge Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBadgeType('rank')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  badgeType === 'rank'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
              >
                <Trophy className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs font-bold">Live Rank</p>
                <p className="text-[10px] text-muted-foreground">Dynamic position</p>
              </button>

              <button
                type="button"
                onClick={() => setBadgeType('founding')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  badgeType === 'founding'
                    ? 'border-amber-500 bg-amber-500/5 shadow-sm'
                    : 'border-border hover:border-amber-500/40 bg-card'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <p className="text-xs font-bold">Founding 100</p>
                <p className="text-[10px] text-muted-foreground">Locked 5% fee tier</p>
              </button>

              <button
                type="button"
                onClick={() => setBadgeType('verified')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  badgeType === 'verified'
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                    : 'border-border hover:border-emerald-500/40 bg-card'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs font-bold">Verified</p>
                <p className="text-[10px] text-muted-foreground">Official trust badge</p>
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 border rounded-xl bg-muted/30 text-center space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Live Badge Preview:</p>
            <div className="inline-block p-2 bg-background rounded-lg border shadow-sm">
              <img src={badgeImgSrc} alt="Badge Preview" className="h-7 mx-auto" />
            </div>
          </div>

          {/* Snippet 1: Markdown for GitHub README */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Markdown (GitHub README.md)</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(markdownSnippet, 'markdown')}
                className="h-7 text-xs gap-1"
              >
                {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'markdown' ? 'Copied' : 'Copy Markdown'}
              </Button>
            </div>
            <pre className="p-3 bg-muted/60 rounded-lg text-xs font-mono overflow-x-auto border text-foreground">
              {markdownSnippet}
            </pre>
          </div>

          {/* Snippet 2: HTML for Website & Footer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">HTML (Website & Landing Page)</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(htmlSnippet, 'html')}
                className="h-7 text-xs gap-1"
              >
                {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'html' ? 'Copied' : 'Copy HTML'}
              </Button>
            </div>
            <pre className="p-3 bg-muted/60 rounded-lg text-xs font-mono overflow-x-auto border text-foreground">
              {htmlSnippet}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
