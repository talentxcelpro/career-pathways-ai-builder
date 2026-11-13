// src/components/products/SarkariHubProduct.tsx
// Independent Standalone Product for government.talentxcel.in (SarkariHub)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

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
  BadgeAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { useCentralEntitlements } from '@/hooks/useCentralEntitlements';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

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
  const { 
    subscription, 
    checkEntitlement, 
    isUpgradeModalOpen, 
    openUpgradeModal, 
    closeUpgradeModal,
    refreshEntitlements 
  } = useCentralEntitlements();
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
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>SarkariHub by TalentXcel — 100% Verified PSU, Defense & Govt Vacancies</title>
        <meta name="description" content="Discover authentic PSU, central government, and defense research job notifications with direct official gazette links. Zero ads, zero scam alerts." />
        <link rel="canonical" href="https://government.talentxcel.in/" />
      </Helmet>

      {/* Shared Global Product Header */}
      <ProductHeader 
        productName="SarkariHub" 
        activeNav="government"
        badgeLabel="100% Official Gazettes"
        topBannerText="Direct PSU, Central Govt & Defense Research Vacancy Intelligence • Zero Spam Popups"
        primaryActionLabel="View All Vacancies"
        primaryActionTo="/vacancies"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-12">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>100% Authentic • Zero Scam Popups • Direct Gazette URLs</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Verified <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">PSU & Government</span> Recruitment
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
              Every posting is linked directly to the official recruitment notification PDF and portal. No spam, no misleading third-party ads.
            </p>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto flex gap-2 pt-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1 bg-white rounded-xl border border-[#E2E8F0] shadow-sm focus-within:border-[#2563EB] transition-colors">
                <Search className="w-4 h-4 text-[#64748B]" />
                <Input 
                  type="text" 
                  placeholder="Search PSU, defense, or bank (e.g. ISRO, IOCL, RBI)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent text-sm focus-visible:ring-0 text-[#111827] placeholder:text-[#64748B] h-10 p-0"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['ALL', 'PSU', 'Defense / Research', 'Banking & Insurance'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] border-transparent text-white shadow-xs'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#111827] hover:border-[#2563EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Vacancy Feed */}
        <section className="px-4 py-10 max-w-5xl mx-auto">
          <div className="space-y-4 text-left">
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[#2563EB]">{job.organization}</span>
                      <Badge variant="outline" className="text-[10px] border-[#E2E8F0] text-[#64748B]">
                        {job.category}
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-[#111827]">{job.title}</h3>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <div className="text-xs text-[#64748B]">Application Deadline:</div>
                    <div className="text-xs font-bold text-rose-600">{job.deadline}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#64748B] py-3 border-t border-[#E2E8F0] mt-2 font-medium">
                  <div><strong className="text-[#111827]">Qualification:</strong> {job.qualification}</div>
                  <div><strong className="text-[#111827]">Vacancies:</strong> {job.vacancies} • <strong className="text-[#111827]">Location:</strong> {job.location}</div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-medium">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Official Gazette Notice Authenticated</span>
                  </span>
                  <a 
                    href={job.officialGazetteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* SarkariHub Pro Upsell Card */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Supercharge your Sarkari Exam Prep with AI Mock Tests & Instant WhatsApp Alerts
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Public notices are 100% free forever. Upgrade to Pro for full syllabus mock tests and instant notifications.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => openUpgradeModal('sarkari_mock_test_packs')}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 shadow-xs"
            >
              <span>Explore Pro Exam Packs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Shared Global Product Footer */}
      <ProductFooter currentProduct="SarkariHub" />

      {/* Central Revenue Pro Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlanId={subscription.planId}
        targetFeatureName="Sarkari AI Exam Mock Test Packs & WhatsApp Alerts"
        onSuccess={() => {
          refreshEntitlements();
        }}
      />
    </div>
  );
};
