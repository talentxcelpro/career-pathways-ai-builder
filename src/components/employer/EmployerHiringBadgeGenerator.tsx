import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Briefcase, ExternalLink, Building2, Code2 } from 'lucide-react';
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
  openRolesCount = 1,
  className = ''
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const jobsUrl = `https://jobs.talentxcel.in/company/${companySlug}`;
  const badgeImgUrl = `https://img.shields.io/badge/TalentXcel-We're_Hiring-2563eb?style=for-the-badge&logo=briefcase&logoColor=white`;

  // Accurate embed code clearly stating jobs are published on TalentXcel
  const htmlSnippet = `<div style="display:inline-flex;align-items:center;gap:12px;border:1px solid #cbd5e1;border-radius:12px;padding:12px 18px;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
  <div style="background:#2563eb;color:#ffffff;border-radius:8px;padding:6px 10px;font-weight:800;font-size:12px;letter-spacing:0.5px;">HIRING</div>
  <div>
    <div style="font-size:13px;font-weight:700;color:#0f172a;">${companyName} is Hiring</div>
    <div style="font-size:11px;color:#64748b;">${openRolesCount} Open ${openRolesCount === 1 ? 'Position' : 'Positions'} on TalentXcel</div>
    <a href="${jobsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">
      Explore Opportunities &rarr;
    </a>
  </div>
</div>`;

  const markdownSnippet = `[![We are hiring on TalentXcel](${badgeImgUrl})](${jobsUrl})`;

  const textSnippet = `Explore verified career openings at ${companyName} on TalentXcel: [View Open Roles](${jobsUrl})`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    toast.success('Hiring badge code copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Card className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl text-slate-100 shadow-xl ${className}`}>
      <CardHeader className="p-6 md:p-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-white">Embed "We're Hiring" Badge</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Add a live verified hiring widget to your company careers page or GitHub repo
              </CardDescription>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
            Dofollow Anchor
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 pt-0 space-y-5">
        {/* Live Badge Preview Box */}
        <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{companyName} is Hiring</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {openRolesCount} {openRolesCount === 1 ? 'Position' : 'Positions'} on TalentXcel &bull; Direct Platform Application
              </div>
            </div>
          </div>
          <a
            href={jobsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>View Jobs Hub</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Code Tabs with Distinct States */}
        <Tabs defaultValue="html" className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
            <TabsList className="inline-flex h-9 items-center justify-start rounded-xl bg-slate-950 p-1 border border-slate-800 text-slate-400">
              <TabsTrigger
                value="html"
                className="h-7 px-3 text-xs font-medium rounded-lg transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm"
              >
                HTML Card
              </TabsTrigger>
              <TabsTrigger
                value="markdown"
                className="h-7 px-3 text-xs font-medium rounded-lg transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm"
              >
                Markdown
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="h-7 px-3 text-xs font-medium rounded-lg transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm"
              >
                Text Link
              </TabsTrigger>
            </TabsList>
            <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" /> Copy &amp; paste into your website
            </span>
          </div>

          {/* HTML Card Tab Content */}
          <TabsContent value="html" className="mt-3 space-y-2">
            <div className="rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
                <span className="font-mono text-[11px] text-slate-400 font-medium">HTML Embed Snippet</span>
                <Button
                  size="sm"
                  className={`h-7 px-3 text-xs gap-1.5 transition-all font-semibold rounded-lg ${
                    copiedType === 'html'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  }`}
                  onClick={() => handleCopy(htmlSnippet, 'html')}
                >
                  {copiedType === 'html' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'html' ? 'Copied!' : 'Copy Code'}</span>
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed max-w-full select-all [scrollbar-width:thin] [scrollbar-color:#334155_#090d16] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-950 [&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                <code>{htmlSnippet}</code>
              </pre>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              Embed directly into your company career portal or footer for candidate routing and search attribution.
            </p>
          </TabsContent>

          {/* Markdown Tab Content */}
          <TabsContent value="markdown" className="mt-3 space-y-2">
            <div className="rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
                <span className="font-mono text-[11px] text-slate-400 font-medium">Markdown Readme Badge</span>
                <Button
                  size="sm"
                  className={`h-7 px-3 text-xs gap-1.5 transition-all font-semibold rounded-lg ${
                    copiedType === 'markdown'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  }`}
                  onClick={() => handleCopy(markdownSnippet, 'markdown')}
                >
                  {copiedType === 'markdown' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'markdown' ? 'Copied!' : 'Copy Code'}</span>
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed max-w-full select-all [scrollbar-width:thin] [scrollbar-color:#334155_#090d16] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-950 [&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                <code>{markdownSnippet}</code>
              </pre>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              Add to your project's GitHub README.md or developer documentation.
            </p>
          </TabsContent>

          {/* Text Link Tab Content */}
          <TabsContent value="link" className="mt-3 space-y-2">
            <div className="rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80 text-xs">
                <span className="font-mono text-[11px] text-slate-400 font-medium">Plain Text / Rich Link</span>
                <Button
                  size="sm"
                  className={`h-7 px-3 text-xs gap-1.5 transition-all font-semibold rounded-lg ${
                    copiedType === 'link'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  }`}
                  onClick={() => handleCopy(textSnippet, 'link')}
                >
                  {copiedType === 'link' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'link' ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed max-w-full select-all [scrollbar-width:thin] [scrollbar-color:#334155_#090d16] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-950 [&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                <code>{textSnippet}</code>
              </pre>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              Share directly via email newsletters, press releases, or social media updates.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmployerHiringBadgeGenerator;
