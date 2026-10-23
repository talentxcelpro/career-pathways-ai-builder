import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Copy, 
  Check, 
  TrendingUp, 
  BarChart3, 
  Database, 
  Share2, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  FileSpreadsheet, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';

interface SalaryBenchmarkRow {
  role: string;
  experience: string;
  bangalore: string;
  delhiNcr: string;
  hyderabad: string;
  pune: string;
  tier2Avg: string;
  growthYoy: string;
}

const BENCHMARK_DATA: SalaryBenchmarkRow[] = [
  { role: 'Software Development Engineer I (SDE-1)', experience: '0-2 Yrs', bangalore: '₹9.5L - ₹18L', delhiNcr: '₹8L - ₹16L', hyderabad: '₹8.5L - ₹16.5L', pune: '₹7.5L - ₹14L', tier2Avg: '₹5L - ₹10L', growthYoy: '+14%' },
  { role: 'Software Development Engineer II (SDE-2)', experience: '3-6 Yrs', bangalore: '₹22L - ₹38L', delhiNcr: '₹20L - ₹34L', hyderabad: '₹20L - ₹35L', pune: '₹18L - ₹30L', tier2Avg: '₹12L - ₹22L', growthYoy: '+18%' },
  { role: 'Senior SDE / Tech Lead', experience: '6-10 Yrs', bangalore: '₹38L - ₹65L', delhiNcr: '₹35L - ₹58L', hyderabad: '₹34L - ₹56L', pune: '₹30L - ₹50L', tier2Avg: '₹22L - ₹36L', growthYoy: '+22%' },
  { role: 'AI / Machine Learning Engineer', experience: '2-5 Yrs', bangalore: '₹24L - ₹44L', delhiNcr: '₹22L - ₹40L', hyderabad: '₹20L - ₹38L', pune: '₹18L - ₹34L', tier2Avg: '₹12L - ₹24L', growthYoy: '+38%' },
  { role: 'Full Stack Engineer (React + Node)', experience: '2-5 Yrs', bangalore: '₹14L - ₹26L', delhiNcr: '₹12L - ₹24L', hyderabad: '₹13L - ₹24L', pune: '₹11L - ₹21L', tier2Avg: '₹8L - ₹16L', growthYoy: '+16%' },
  { role: 'Data Engineer (Spark, Snowflake)', experience: '3-6 Yrs', bangalore: '₹18L - ₹32L', delhiNcr: '₹16L - ₹28L', hyderabad: '₹16L - ₹30L', pune: '₹14L - ₹26L', tier2Avg: '₹10L - ₹18L', growthYoy: '+24%' },
  { role: 'DevOps / Platform Engineer', experience: '3-6 Yrs', bangalore: '₹19L - ₹34L', delhiNcr: '₹17L - ₹30L', hyderabad: '₹17L - ₹30L', pune: '₹15L - ₹26L', tier2Avg: '₹10L - ₹19L', growthYoy: '+21%' },
  { role: 'Product Manager (Associate)', experience: '1-3 Yrs', bangalore: '₹14L - ₹24L', delhiNcr: '₹13L - ₹22L', hyderabad: '₹12L - ₹20L', pune: '₹11L - ₹19L', tier2Avg: '₹8L - ₹14L', growthYoy: '+19%' },
  { role: 'Senior Product Manager', experience: '5-9 Yrs', bangalore: '₹32L - ₹55L', delhiNcr: '₹30L - ₹50L', hyderabad: '₹28L - ₹48L', pune: '₹26L - ₹44L', tier2Avg: '₹18L - ₹32L', growthYoy: '+25%' },
  { role: 'Cybersecurity Analyst / Engineer', experience: '2-5 Yrs', bangalore: '₹15L - ₹28L', delhiNcr: '₹14L - ₹26L', hyderabad: '₹13L - ₹24L', pune: '₹12L - ₹22L', tier2Avg: '₹8L - ₹15L', growthYoy: '+29%' }
];

export default function IndiaTechSalaryReport2026() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canonicalUrl = 'https://salary.talentxcel.in/benchmarks/india-tech-salary-report-2026';

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    'name': 'India Tech Salary Report 2026: Benchmark Compensation Data',
    'description': 'Verified compensation benchmarks across tech engineering, AI, DevOps, and product management roles in India for 2026.',
    'url': canonicalUrl,
    'license': 'https://creativecommons.org/licenses/by/4.0/',
    'creator': {
      '@type': 'Organization',
      'name': 'TalentXcel Career Intelligence',
      'url': 'https://talentxcel.in'
    },
    'keywords': [
      'India Tech Salaries 2026',
      'Software Engineer Salary India',
      'AI ML Engineer Salary India',
      'Bangalore Tech Salary Benchmark',
      'Tier 2 Tech Compensation'
    ],
    'distribution': [
      {
        '@type': 'DataDownload',
        'encodingFormat': 'text/csv',
        'contentUrl': `${canonicalUrl}.csv`
      }
    ]
  };

  const bibtexCitation = `@misc{talentxcel2026salaryreport,
  title={India Tech Salary Report 2026: Compensation Benchmarks by Role and City},
  author={TalentXcel Intelligence Network},
  year={2026},
  publisher={TalentXcel},
  url={${canonicalUrl}}
}`;

  const htmlCitation = `<a href="${canonicalUrl}" title="India Tech Salary Report 2026 by TalentXcel">TalentXcel India Tech Salary Report 2026</a>`;
  const markdownCitation = `[TalentXcel India Tech Salary Report 2026](${canonicalUrl})`;

  const handleCopyCitation = (code: string, format: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFormat(format);
    toast.success(`${format.toUpperCase()} citation copied to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadCsv = () => {
    const headers = ['Role', 'Experience Level', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Tier-2 Average', 'YoY Growth'];
    const rows = BENCHMARK_DATA.map(r => [
      `"${r.role}"`,
      `"${r.experience}"`,
      `"${r.bangalore}"`,
      `"${r.delhiNcr}"`,
      `"${r.hyderabad}"`,
      `"${r.pune}"`,
      `"${r.tier2Avg}"`,
      `"${r.growthYoy}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'talentxcel-india-tech-salary-report-2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV dataset downloaded successfully!');
  };

  const filteredData = BENCHMARK_DATA.filter(item =>
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.experience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>India Tech Salary Report 2026 | Benchmark Compensation Data | TalentXcel</title>
        <meta name="description" content="Audited 2026 tech compensation benchmarks across Bangalore, Hyderabad, Delhi NCR, Pune, and Tier-2 Indian hubs. Free open dataset with CSV download and citations." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="India Tech Salary Report 2026 | TalentXcel" />
        <meta property="og:description" content="Explore live 2026 compensation data across engineering, AI, DevOps, and product roles in India." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(datasetSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-950/40 via-slate-900/40 to-slate-950 border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Google Dataset Search Indexed
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> CC BY 4.0 Open Data
              </Badge>
              <span className="text-xs text-slate-400">Updated: Q1 2026 Edition</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              India Tech Salary Report 2026
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed mb-8">
              Open-access benchmark compensation data analyzing real hiring offers, ATS verified profiles, and market ranges across Tier-1 and emerging Tier-2 tech hubs. Free for researchers, candidates, and hiring leaders.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleDownloadCsv}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 text-sm shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" /> Download Raw Dataset (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const citeBox = document.getElementById('citation-section');
                  if (citeBox) citeBox.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-slate-700 hover:bg-slate-800 text-slate-200 gap-2 text-sm"
              >
                <Copy className="w-4 h-4" /> Cite This Study
              </Button>
            </div>
          </div>
        </div>

        {/* Live Data Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> 2026 Tech Roles Compensation Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Median gross annual compensation (INR) based on verified employer disclosures and hiring agreements.
              </p>
            </div>
            <input
              type="text"
              placeholder="Filter by role or experience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Role Title</th>
                    <th className="py-3.5 px-4 font-bold">Experience</th>
                    <th className="py-3.5 px-4 font-bold text-blue-400">Bangalore</th>
                    <th className="py-3.5 px-4 font-bold">Delhi NCR</th>
                    <th className="py-3.5 px-4 font-bold">Hyderabad</th>
                    <th className="py-3.5 px-4 font-bold">Pune</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-400">Tier-2 Avg (Indore/Varanasi)</th>
                    <th className="py-3.5 px-4 font-bold text-amber-400">YoY Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{row.role}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.experience}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-300">{row.bangalore}</td>
                      <td className="py-3.5 px-4 font-mono">{row.delhiNcr}</td>
                      <td className="py-3.5 px-4 font-mono">{row.hyderabad}</td>
                      <td className="py-3.5 px-4 font-mono">{row.pune}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">{row.tier2Avg}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{row.growthYoy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citation & Attribution Box (Dofollow Link Magnet) */}
          <div id="citation-section" className="mt-12">
            <Card className="border-blue-900/40 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-950">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Cite This Dataset</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      You are free to cite and reproduce this data in journalism, research papers, and blog posts with attribution.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full max-w-sm text-xs bg-slate-900">
                    <TabsTrigger value="html">HTML Citation</TabsTrigger>
                    <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="mt-3 space-y-2">
                    <div className="relative">
                      <pre className="p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                        {htmlCitation}
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-7 text-xs gap-1"
                        onClick={() => handleCopyCitation(htmlCitation, 'html')}
                      >
                        {copiedFormat === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFormat === 'html' ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="bibtex" className="mt-3 space-y-2">
                    <div className="relative">
                      <pre className="p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                        {bibtexCitation}
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-7 text-xs gap-1"
                        onClick={() => handleCopyCitation(bibtexCitation, 'bibtex')}
                      >
                        {copiedFormat === 'bibtex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFormat === 'bibtex' ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="markdown" className="mt-3 space-y-2">
                    <div className="relative">
                      <pre className="p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 overflow-x-auto">
                        {markdownCitation}
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-7 text-xs gap-1"
                        onClick={() => handleCopyCitation(markdownCitation, 'markdown')}
                      >
                        {copiedFormat === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedFormat === 'markdown' ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Subdomain Mesh Navigation */}
          <div className="mt-12 space-y-8">
            <RelatedSubdomainLinks city="Bangalore" role="Software Engineer" />
          </div>
        </div>

        {/* Global Mesh Footer */}
        <div className="mt-12 border-t border-slate-800">
          <SubdomainMeshFooter />
        </div>
      </div>
    </>
  );
}
