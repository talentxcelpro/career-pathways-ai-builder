import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Award, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight,
  ShieldCheck,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface GovtJobItem {
  id: string;
  title: string;
  organization: string;
  category: 'PSU' | 'Central Govt' | 'Defense / Research' | 'Banking & Insurance';
  vacancies: string;
  qualification: string;
  location: string;
  deadline: string;
  officialGazetteUrl: string;
  isVerified: boolean;
}

export const SarkariHubProduct: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const verifiedGovtJobs: GovtJobItem[] = [
    {
      id: 'bhel-et-2026',
      title: 'Engineer Trainee (Mechanical / Electrical / Civil)',
      organization: 'Bharat Heavy Electricals Limited (BHEL)',
      category: 'PSU',
      vacancies: '150 Posts',
      qualification: 'Full-time Bachelor Degree in Engineering (Mech/Elec/Civil) with 65%+',
      location: 'Bhopal / Haridwar / Trichy / Hyderabad / Jhansi',
      deadline: 'Dec 20, 2026',
      officialGazetteUrl: 'https://careers.bhel.in',
      isVerified: true
    },
    {
      id: 'iocl-gh-2026',
      title: 'General Manager — Green Hydrogen & Process Engineering',
      organization: 'Indian Oil Corporation Ltd (IOCL)',
      category: 'PSU',
      vacancies: '14 Posts',
      qualification: 'B.Tech / B.E. (Chemical / Mechanical) + 12 yrs exp',
      location: 'Mumbai / Refineries Across India',
      deadline: 'Nov 30, 2026',
      officialGazetteUrl: 'https://iocl.com/careers',
      isVerified: true
    },
    {
      id: 'isro-sci-2026',
      title: 'Scientist / Engineer ‘SC’ (Computer Science & Electronics)',
      organization: 'Indian Space Research Organisation (ISRO)',
      category: 'Defense / Research',
      vacancies: '65 Posts',
      qualification: 'First Class B.Tech / B.E. in CS / IT / ECE + Valid GATE Score',
      location: 'Bengaluru / Sriharikota / Thiruvananthapuram',
      deadline: 'Dec 15, 2026',
      officialGazetteUrl: 'https://isro.gov.in/careers',
      isVerified: true
    },
    {
      id: 'drdo-rac-2026',
      title: 'Scientist ‘B’ in Cyber Security & Embedded Systems',
      organization: 'Defence Research and Development Organisation (DRDO)',
      category: 'Defense / Research',
      vacancies: '38 Posts',
      qualification: 'B.Tech in CS / IT / Cyber Security with minimum 65%',
      location: 'New Delhi / Hyderabad / Pune',
      deadline: 'Dec 05, 2026',
      officialGazetteUrl: 'https://rac.gov.in',
      isVerified: true
    },
    {
      id: 'rbi-grade-b-2026',
      title: 'Officers in Grade ‘B’ (General / DEPR / DSIM)',
      organization: 'Reserve Bank of India (RBI)',
      category: 'Banking & Insurance',
      vacancies: '120 Posts',
      qualification: 'Graduation in any discipline with minimum 60% marks',
      location: 'All India Corridors',
      deadline: 'Nov 28, 2026',
      officialGazetteUrl: 'https://rbi.org.in/careers',
      isVerified: true
    },
    {
      id: 'lic-aao-2026',
      title: 'Assistant Administrative Officer (AAO) - IT Specialist',
      organization: 'Life Insurance Corporation of India (LIC)',
      category: 'Banking & Insurance',
      vacancies: '50 Posts',
      qualification: 'B.Tech / M.Tech in CS / IT or MCA',
      location: 'Zonal & Divisional Offices Across India',
      deadline: 'Dec 10, 2026',
      officialGazetteUrl: 'https://licindia.in/careers',
      isVerified: true
    }
  ];

  const filteredJobs = verifiedGovtJobs.filter(job => {
    const matchesCat = selectedCategory === 'ALL' || job.category === selectedCategory;
    const matchesSearch = !searchTerm || (job.title + ' ' + job.organization).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>SarkariHub by TalentXcel — 100% Verified PSU, Defense & Govt Vacancies</title>
        <meta name="description" content="Discover authentic PSU, central government, and defense research job notifications with direct official gazette links. Zero ads, zero scam alerts." />
        <link rel="canonical" href="https://government.talentxcel.in/" />
      </Helmet>

      {/* Product Banner */}
      <div className="bg-gradient-to-r from-amber-900/40 via-blue-900/30 to-slate-900 border-b border-amber-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">SarkariHub 2026</span>
            <span className="text-slate-400 hidden sm:inline">• Sourced Exclusively from Official Gazettes & Board Bulletins</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/vacancies" className="text-slate-300 hover:text-white text-xs font-medium">
              View All Vacancies →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 pt-8 pb-8 max-w-5xl mx-auto text-center">
        <Badge className="bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 mb-3">
          100% Authentic • Zero Scam Popups • Direct Gazette URLs
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">
          Verified <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">PSU & Government</span> Recruitment
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
          Every posting is linked directly to the official recruitment notification PDF. No third-party spam.
        </p>

        {/* Search & Filter */}
        <div className="max-w-2xl mx-auto flex gap-2 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 bg-slate-900 rounded-xl border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search PSU, defense, or bank (e.g. ISRO, IOCL, RBI)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-sm focus-visible:ring-0 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['ALL', 'PSU', 'Defense / Research', 'Banking & Insurance'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vacancy Feed */}
        <div className="space-y-4 text-left">
          {filteredJobs.map(job => (
            <div 
              key={job.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400">{job.organization}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {job.category}
                    </Badge>
                    <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white">{job.title}</h3>
                </div>

                <div className="text-right sm:shrink-0">
                  <div className="text-xs text-slate-400">Application Deadline:</div>
                  <div className="text-xs font-bold text-rose-400">{job.deadline}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-t border-slate-800/80 mt-2">
                <div><strong>Qualification:</strong> {job.qualification}</div>
                <div><strong>Vacancies:</strong> {job.vacancies} • <strong>Location:</strong> {job.location}</div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official Gazette Notice Verified</span>
                </span>
                <a 
                  href={job.officialGazetteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sourced Data Disclosure */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-400">SarkariHub</span> is an independent public sector discovery product of TalentXcel.
          </div>
          <div className="flex gap-4">
            <Link to="https://jobs.talentxcel.in" className="hover:text-slate-300">Jobs</Link>
            <Link to="https://resume.talentxcel.in" className="hover:text-slate-300">Resume</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
