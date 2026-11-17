import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Award, ExternalLink, ShieldCheck, ArrowRight, Code2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showEmbedStudio, setShowEmbedStudio] = useState<boolean>(false);

  // Canonical Passport & Profile URL (Strictly /u/:slug)
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

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    toast.success('Passport link copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

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
        {/* Live Verified Credential Card Preview */}
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

        {/* Clean Link Bar with 1-Click Copy */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground">Canonical Passport URL</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-muted/60 border text-xs font-mono text-foreground truncate select-all">
              {passportUrl}
            </div>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 h-9 px-3.5 gap-1.5"
              onClick={() => handleCopy(passportUrl, 'canonical-url')}
            >
              {copiedType === 'canonical-url' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Stamp this link on your Resume PDF header for instant recruiter verification.
          </p>
        </div>

        {/* Primary Action Button */}
        <Button
          asChild
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-sm h-10"
        >
          <Link to={`/u/${candidateSlug}`}>
            View Full Career Passport <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>

        {/* Embed Studio (Collapsed by default so NO raw code clutters the UI) */}
        {isOwnProfile && (
          <div className="pt-2 border-t border-border/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmbedStudio(!showEmbedStudio)}
              className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground justify-between h-8 px-2"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-blue-500" />
                Embed Badge on GitHub / Website
              </span>
              {showEmbedStudio ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {showEmbedStudio && (
              <div className="mt-3 space-y-3 pt-2">
                <Tabs defaultValue="markdown" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full text-xs">
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                    <TabsTrigger value="html">HTML Widget</TabsTrigger>
                    <TabsTrigger value="link">Anchor Link</TabsTrigger>
                  </TabsList>

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
                        {copiedType === 'markdown' ? 'Copied' : 'Copy Snippet'}
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
                        {copiedType === 'html' ? 'Copied' : 'Copy HTML'}
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerPassportEmbedBadge;
