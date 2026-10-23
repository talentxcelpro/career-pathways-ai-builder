import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Code, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ATSScoreEmbedBadgeProps {
  score?: number;
  candidateName?: string;
  roleTarget?: string;
  className?: string;
}

export const ATSScoreEmbedBadge: React.FC<ATSScoreEmbedBadgeProps> = ({
  score = 88,
  candidateName = 'TalentXcel Candidate',
  roleTarget = 'Software Engineer',
  className = ''
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const targetUrl = 'https://resume.talentxcel.in/ats-check';
  const badgeImgUrl = `https://img.shields.io/badge/TalentXcel_ATS_Score-${score}%2F100-10b981?style=for-the-badge&logo=target&logoColor=white`;

  const htmlSnippet = `<div style="display:inline-block;border:1px solid #e2e8f0;border-radius:12px;padding:12px 18px;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
  <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;text-transform:uppercase;">TalentXcel Verified ATS Score</div>
  <div style="font-size:22px;font-weight:900;color:#0f172a;margin:4px 0;">${score}/100 &bull; <span style="color:#10b981;font-size:16px;">Top 10%</span></div>
  <a href="${targetUrl}" target="_blank" rel="noopener" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
    Verified by TalentXcel ATS Resume Checker &rarr;
  </a>
</div>`;

  const markdownSnippet = `[![TalentXcel ATS Score ${score}/100](${badgeImgUrl})](${targetUrl})`;

  const textAttribution = `ATS Resume Score: ${score}/100 (Verified by [TalentXcel Resume Builder](${targetUrl}))`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    toast.success('Embed badge snippet copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Card className={`border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Embed Verified ATS Badge</CardTitle>
              <CardDescription className="text-xs">
                Showcase your verified score on your GitHub README, Portfolio, or personal blog
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
            Crawl Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live Badge Preview */}
        <div className="p-4 rounded-xl border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TalentXcel Verified ATS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-semibold">90th Percentile</span>
            </div>
            <div className="text-2xl font-black text-foreground">
              {score}<span className="text-sm font-normal text-muted-foreground">/100</span>
              <span className="text-xs font-medium text-muted-foreground ml-2">({roleTarget})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={targetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Verify on TalentXcel <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Snippet Code Tabs */}
        <Tabs defaultValue="markdown" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xs text-xs">
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="html">HTML Card</TabsTrigger>
            <TabsTrigger value="link">Text Link</TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground">
                {markdownSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 h-7 text-xs gap-1"
                onClick={() => handleCopy(markdownSnippet, 'markdown')}
              >
                {copiedType === 'markdown' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'markdown' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Paste directly into your GitHub <code className="text-foreground">README.md</code> profile.
            </p>
          </TabsContent>

          <TabsContent value="html" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground">
                {htmlSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 h-7 text-xs gap-1"
                onClick={() => handleCopy(htmlSnippet, 'html')}
              >
                {copiedType === 'html' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'html' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Embed onto your personal portfolio or Webflow/WordPress site.
            </p>
          </TabsContent>

          <TabsContent value="link" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground">
                {textAttribution}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 h-7 text-xs gap-1"
                onClick={() => handleCopy(textAttribution, 'link')}
              >
                {copiedType === 'link' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'link' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
export default ATSScoreEmbedBadge;
