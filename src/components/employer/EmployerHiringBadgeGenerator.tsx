import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Briefcase, ExternalLink, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmployerHiringBadgeGeneratorProps {
  companyName?: string;
  companySlug?: string;
  openRolesCount?: number;
  className?: string;
}

export const EmployerHiringBadgeGenerator: React.FC<EmployerHiringBadgeGeneratorProps> = ({
  companyName = 'TalentXcel Verified Employer',
  companySlug = 'talentxcel',
  openRolesCount = 5,
  className = ''
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const jobsUrl = `https://jobs.talentxcel.in/company/${companySlug}`;
  const badgeImgUrl = `https://img.shields.io/badge/TalentXcel-We're_Hiring-2563eb?style=for-the-badge&logo=briefcase&logoColor=white`;

  const htmlSnippet = `<div style="display:inline-flex;align-items:center;gap:12px;border:1px solid #cbd5e1;border-radius:12px;padding:12px 18px;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
  <div style="background:#2563eb;color:#ffffff;border-radius:8px;padding:6px 10px;font-weight:800;font-size:12px;">HIRE</div>
  <div>
    <div style="font-size:13px;font-weight:700;color:#0f172a;">${companyName} is Hiring</div>
    <div style="font-size:11px;color:#64748b;">${openRolesCount} Open Positions &bull; Direct Applications</div>
    <a href="${jobsUrl}" target="_blank" rel="noopener" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">
      View Verified Jobs on TalentXcel &rarr;
    </a>
  </div>
</div>`;

  const markdownSnippet = `[![We are hiring on TalentXcel](${badgeImgUrl})](${jobsUrl})`;

  const textSnippet = `Explore career openings at ${companyName}: [View Open Roles on TalentXcel](${jobsUrl})`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    toast.success('Hiring badge snippet copied!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Card className={`border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-500/5 via-background to-cyan-500/5 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Embed "We're Hiring" Badge</CardTitle>
              <CardDescription className="text-xs">
                Add an official live hiring widget to your company careers page or GitHub repo
              </CardDescription>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
            Dofollow Anchor
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live Badge Preview */}
        <div className="p-4 rounded-xl border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{companyName} is Hiring</div>
              <div className="text-xs text-muted-foreground">{openRolesCount} Active Roles &bull; Verified Employer</div>
            </div>
          </div>
          <a
            href={jobsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            View Jobs Hub <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Code Tabs */}
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xs text-xs">
            <TabsTrigger value="html">HTML Card</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="link">Text Link</TabsTrigger>
          </TabsList>

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
                {copiedType === 'html' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'html' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Add directly to your company careers page or footer for crawl attribution.
            </p>
          </TabsContent>

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
                {copiedType === 'markdown' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'markdown' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-3 space-y-2">
            <div className="relative">
              <pre className="p-3 text-xs rounded-lg bg-muted font-mono overflow-x-auto text-muted-foreground">
                {textSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 h-7 text-xs gap-1"
                onClick={() => handleCopy(textSnippet, 'link')}
              >
                {copiedType === 'link' ? <Check className="h-3.5 w-3.5 text-blue-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === 'link' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
export default EmployerHiringBadgeGenerator;
