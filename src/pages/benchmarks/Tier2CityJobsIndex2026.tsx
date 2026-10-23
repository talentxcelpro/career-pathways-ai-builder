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
  Building2, 
  Database, 
  MapPin, 
  ShieldCheck, 
  FileSpreadsheet, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';

interface Tier2CityIndexRow {
  city: string;
  state: string;
  hiringGrowthYoy: string;
  activeOpenings: string;
  avgTechSalary: string;
  topSectors: string;
  keyEmployers: string;
}

const TIER2_INDEX_DATA: Tier2CityIndexRow[] = [
  { city: 'Indore', state: 'Madhya Pradesh', hiringGrowthYoy: '+34%', activeOpenings: '1,840+', avgTechSalary: '₹6.8L - ₹14.5L', topSectors: 'IT Services, Fintech, SaaS', keyEmployers: 'TCS, Infosys, Impetus, Yash Technologies' },
  { city: 'Varanasi', state: 'Uttar Pradesh', hiringGrowthYoy: '+42%', activeOpenings: '720+', avgTechSalary: '₹4.5L - ₹11.2L', topSectors: 'EdTech, Logistics, Banking', keyEmployers: 'Utkarsh Small Finance Bank, TCS, BYJU\'S, Local IT' },
  { city: 'Jaipur', state: 'Rajasthan', hiringGrowthYoy: '+28%', activeOpenings: '2,150+', avgTechSalary: '₹5.5L - ₹13.8L', topSectors: 'Fintech, Healthcare IT, E-commerce', keyEmployers: 'Genpact, Infosys, Wipro, Metacube' },
  { city: 'Coimbatore', state: 'Tamil Nadu', hiringGrowthYoy: '+31%', activeOpenings: '1,960+', avgTechSalary: '₹6.2L - ₹15.0L', topSectors: 'Automotive Embedded, SaaS, Industrial IoT', keyEmployers: 'Bosch, Cognizant, KGISL, Pricol' },
  { city: 'Kochi', state: 'Kerala', hiringGrowthYoy: '+29%', activeOpenings: '1,680+', avgTechSalary: '₹6.0L - ₹14.2L', topSectors: 'Cloud Computing, Maritime Tech, AI', keyEmployers: 'Infopark MNCs, UST, Wipro, IBS Software' },
  { city: 'Chandigarh / Mohali', state: 'Punjab / Haryana', hiringGrowthYoy: '+26%', activeOpenings: '2,400+', avgTechSalary: '₹6.5L - ₹15.5L', topSectors: 'BPO/KPO, Mobile App Dev, Healthcare', keyEmployers: 'Infosys, Quark, Tech Mahindra, Net Solutions' },
  { city: 'Lucknow', state: 'Uttar Pradesh', hiringGrowthYoy: '+36%', activeOpenings: '1,520+', avgTechSalary: '₹5.2L - ₹13.0L', topSectors: 'IT Parks, Governance Tech, Banking', keyEmployers: 'TCS Campus, HCL Technologies, Medanta' },
  { city: 'Nagpur', state: 'Maharashtra', hiringGrowthYoy: '+27%', activeOpenings: '1,340+', avgTechSalary: '₹5.8L - ₹13.5L', topSectors: 'Aviation MRO, Logistics Tech, IT', keyEmployers: 'MIHAN SEZ, Infosys, Tech Mahindra, Persistent' },
  { city: 'Bhubaneswar', state: 'Odisha', hiringGrowthYoy: '+32%', activeOpenings: '1,280+', avgTechSalary: '₹5.5L - ₹13.2L', topSectors: 'IT Services, Metals & Mining Tech, Core Engineering', keyEmployers: 'TCS, Infosys, Wipro, Mindtree' },
  { city: 'Vadodara', state: 'Gujarat', hiringGrowthYoy: '+25%', activeOpenings: '1,450+', avgTechSalary: '₹5.4L - ₹12.8L', topSectors: 'Chemicals, Pharma Tech, Mechanical IT', keyEmployers: 'L&T Technology, Alembic, TCS, Rishabh Software' }
];

export default function Tier2CityJobsIndex2026() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canonicalUrl = 'https://jobs.talentxcel.in/benchmarks/tier-2-city-jobs-index-2026';

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    'name': 'Tier-2 City Jobs Growth Index 2026',
    'description': 'Comprehensive employment growth and compensation index across 10 top emerging Tier-2 Indian tech centers for 2026.',
    'url': canonicalUrl,
    'license': 'https://creativecommons.org/licenses/by/4.0/',
    'creator': {
      '@type': 'Organization',
      'name': 'TalentXcel Career Intelligence',
      'url': 'https://talentxcel.in'
    },
    'keywords': [
      'Tier 2 City Jobs India 2026',
      'Tech Hiring Indore Varanasi Jaipur',
      'Indian IT Decentralization Index',
      'Tier 2 vs Tier 1 Salaries India'
    ],
    'distribution': [
      {
        '@type': 'DataDownload',
        'encodingFormat': 'text/csv',
        'contentUrl': `${canonicalUrl}.csv`
      }
    ]
  };

  const bibtexCitation = `@misc{talentxcel2026tier2jobs,
  title={Tier-2 City Jobs Growth Index 2026: Regional Tech Decentralization and Hiring Trajectories},
  author={TalentXcel Research Team},
  year={2026},
  publisher={TalentXcel},
  url={${canonicalUrl}}
}`;

  const htmlCitation = `<a href="${canonicalUrl}" title="Tier-2 City Jobs Index 2026 by TalentXcel">TalentXcel Tier-2 City Jobs Index 2026</a>`;
  const markdownCitation = `[TalentXcel Tier-2 City Jobs Index 2026](${canonicalUrl})`;

  const handleCopyCitation = (code: string, format: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFormat(format);
    toast.success(`${format.toUpperCase()} citation copied to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadCsv = () => {
    const headers = ['City', 'State', 'Hiring Growth YoY', 'Active Openings', 'Avg Tech Salary', 'Top Sectors', 'Key Employers'];
    const rows = TIER2_INDEX_DATA.map(r => [
      `"${r.city}"`,
      `"${r.state}"`,
      `"${r.hiringGrowthYoy}"`,
      `"${r.activeOpenings}"`,
      `"${r.avgTechSalary}"`,
      `"${r.topSectors}"`,
      `"${r.keyEmployers}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'talentxcel-tier-2-city-jobs-index-2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Tier-2 City Index CSV downloaded!');
  };

  const filteredData = TIER2_INDEX_DATA.filter(item =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topSectors.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Tier-2 City Jobs Index 2026 | Regional Tech Hiring Trends | TalentXcel</title>
        <meta name="description" content="Audited 2026 hiring growth, active job openings, and tech salary index across Indore, Varanasi, Jaipur, Coimbatore, Kochi, and emerging Indian hubs." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Tier-2 City Jobs Index 2026 | TalentXcel" />
        <meta property="og:description" content="Explore regional tech growth and decentralization benchmarks across emerging Indian cities." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(datasetSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900/40 to-slate-950 border-b border-slate-800/80 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Google Dataset Search Indexed
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Open Access Research
              </Badge>
              <span className="text-xs text-slate-400">Updated: 2026 Annual Edition</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Tier-2 City Jobs Growth Index 2026
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed mb-8">
              A detailed benchmark study measuring the velocity of IT, technology services, and corporate decentralization across emerging Indian urban hubs outside the 6 metros.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleDownloadCsv}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 text-sm shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" /> Download Index CSV
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
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Tier-2 Regional Hiring &amp; Salary Benchmark
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparative analysis of YoY job growth, salary bands, and dominant tech sectors.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search city, state, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-white">Hub City</th>
                    <th className="py-3.5 px-4 font-bold">State</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-400">YoY Growth</th>
                    <th className="py-3.5 px-4 font-bold">Active Jobs</th>
                    <th className="py-3.5 px-4 font-bold text-blue-300">Avg Tech Range</th>
                    <th className="py-3.5 px-4 font-bold">Top Sectors</th>
                    <th className="py-3.5 px-4 font-bold">Key Employers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {row.city}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{row.state}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-400">{row.hiringGrowthYoy}</td>
                      <td className="py-3.5 px-4 font-mono">{row.activeOpenings}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-300">{row.avgTechSalary}</td>
                      <td className="py-3.5 px-4 text-slate-300">{row.topSectors}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.keyEmployers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citation & Attribution Box */}
          <div id="citation-section" className="mt-12">
            <Card className="border-emerald-900/40 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Cite This Research Study</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Standard citation formats for academic papers, market analysis, and journalism.
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
            <RelatedSubdomainLinks city="Indore" role="Software Engineer" />
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
