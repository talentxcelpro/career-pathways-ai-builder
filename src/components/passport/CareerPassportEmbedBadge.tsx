import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Award, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CareerPassportEmbedBadgeProps {
  candidateSlug?: string;
  candidateName?: string;
  verifiedSkillsCount?: number;
  isOwnProfile?: boolean;
  className?: string;
}

export const CareerPassportEmbedBadge: React.FC<CareerPassportEmbedBadgeProps> = ({
  candidateSlug = 'talent',
  candidateName = 'TalentXcel Professional',
  verifiedSkillsCount = 6,
  isOwnProfile = false,
  className = ''
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Canonical Passport & Profile URLs
  const passportUrl = `https://talentxcel.in/u/${candidateSlug}`;
  const badgeImgUrl = `https://img.shields.io/badge/TalentXcel-Verified_Passport-3b82f6?style=for-the-badge&logo=credential&logoColor=white`;

  const htmlSnippet = `<div style="display:inline-flex;align-items:center;gap:12px;border:1px solid #cbd5e1;border-radius:12px;padding:12px 16px;background:#ffffff;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
  <div style="background:#2563eb;color:#ffffff;border-radius:8px;padding:8px 10px;font-weight:800;font-size:12px;letter-spacing:0.04em;">TXC</div>
  <div>
    <div style="font-size:13px;font-weight:700;color:#0f172a;">${candidateName}</div>
    <div style="font-size:11px;color:#64748b;">${verifiedSkillsCount} Verified Skills &bull; Identity Confirmed</div>
    <a href="${passportUrl}" target="_blank" rel="noopener" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">
      Verified Career Passport by TalentXcel &rarr;
    </a>
  </div>
</div>`;

  const markdownSnippet = `[![TalentXcel Verified Career Passport](${badgeImgUrl})](${passportUrl})`;
  const textSnippet = `Verified Career Passport: [${candidateName} on TalentXcel](${passportUrl})`;
  const resumeUrlSnippet = passportUrl;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    toast.success('Passport link copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // ── 1. PUBLIC VISITOR VIEW (Strictly No Raw Code) ──
  if (!isOwnProfile) {
    return (
      <Card className={`border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-500/5 via-background to-indigo-500/5 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Verified Career Passport</CardTitle>
                <CardDescription className="text-xs">
                  Authenticated credential on the TalentXcel global network
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shrink-0">
              <Check className="h-3 w-3" /> Verified
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Live Verified Credential Card */}
          <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-card/80 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                TXC
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{candidateName}</div>
                <div className="text-xs text-muted-foreground">{verifiedSkillsCount} Verified Skills &bull; Level 2 Passport</div>
              </div>
            </div>
            <Link
              to={`/u/${candidateSlug}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Preview <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Skills, competencies, and identity confirmed. Authenticated for direct recruiter outreach and peer verification.
          </p>

          {/* Clean Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-sm"
            >
              <Link to={`/u/${candidateSlug}`}>
                View Career Passport <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-medium"
              onClick={() => handleCopy(passportUrl, 'passport-link')}
            >
              {copiedType === 'passport-link' ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                  Copied Passport Link!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Passport Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── 2. OWNER VIEW (Profile Owner Embed & Share Studio) ──
  return (
    <Card className={`border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-500/5 via-background to-indigo-500/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Embed Career Passport Badge</CardTitle>
              <CardDescription className="text-xs">
                Add your verified TalentXcel credential to GitHub, personal websites, or LinkedIn
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
            Shareable Credential
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live Badge Preview */}
        <div className="p-4 rounded-xl border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              TXC
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{candidateName}</div>
              <div className="text-xs text-muted-foreground">{verifiedSkillsCount} Verified Skills &bull; Level 2 Passport</div>
            </div>
          </div>
          <Link
            to={`/u/${candidateSlug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Preview Passport <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Code Tabs with non-overlapping header toolbars */}
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid grid-cols-4 w-full text-xs">
            <TabsTrigger value="resume">Resume Link</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="html">HTML Card</TabsTrigger>
            <TabsTrigger value="link">Text Link</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Stamp on PDF resume headers:</span>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(resumeUrlSnippet, 'resume')}
              >
                {copiedType === 'resume' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'resume' ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
            <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
              {resumeUrlSnippet}
            </pre>
          </TabsContent>

          <TabsContent value="markdown" className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">GitHub README.md snippet:</span>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(markdownSnippet, 'markdown')}
              >
                {copiedType === 'markdown' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'markdown' ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
            <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
              {markdownSnippet}
            </pre>
          </TabsContent>

          <TabsContent value="html" className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Portfolio HTML widget snippet:</span>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(htmlSnippet, 'html')}
              >
                {copiedType === 'html' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'html' ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
            <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
              {htmlSnippet}
            </pre>
          </TabsContent>

          <TabsContent value="link" className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Plain anchor text:</span>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(textSnippet, 'link')}
              >
                {copiedType === 'link' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'link' ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
            <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
              {textSnippet}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CareerPassportEmbedBadge;
