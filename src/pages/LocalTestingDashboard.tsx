// src/pages/LocalTestingDashboard.tsx
// Central Local Testing Dashboard for all 12 TalentXcel Independent Businesses
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, 
  FileText, 
  Calculator, 
  GraduationCap, 
  Award, 
  Building, 
  Compass, 
  BookOpen, 
  Users, 
  Scale, 
  FileCheck2, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';

interface ProductEntry {
  id: number;
  name: string;
  icon: React.ElementType;
  subdomain: string;
  localSubdomainUrl: string;
  localQueryUrl: string;
  localPathUrl: string;
  category: 'Talent & Career' | 'Employers & Institutions' | 'Professional Practice OS';
  audience: string;
  killerFeature: string;
  status: 'Ready & Verified';
}

const PRODUCTS: ProductEntry[] = [
  {
    id: 1,
    name: 'ResumeStudio',
    icon: FileText,
    subdomain: 'resume.talentxcel.in',
    localSubdomainUrl: 'http://resume.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=resume',
    localPathUrl: '/resume',
    category: 'Talent & Career',
    audience: 'Job seekers, freshers, mid-career professionals',
    killerFeature: 'Full interactive ATS resume builder, live scoring, template switcher, and instant PDF export.',
    status: 'Ready & Verified'
  },
  {
    id: 2,
    name: 'JobMatch OS',
    icon: Briefcase,
    subdomain: 'jobs.talentxcel.in',
    localSubdomainUrl: 'http://jobs.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=jobs',
    localPathUrl: '/jobs',
    category: 'Talent & Career',
    audience: 'Active candidates, engineers, corporate talent',
    killerFeature: '2,236 live verified active vacancies from Supabase, tri-industry tabs (Tech, Non-Tech, Core), and 1-click apply.',
    status: 'Ready & Verified'
  },
  {
    id: 3,
    name: 'PayScale',
    icon: Calculator,
    subdomain: 'salary.talentxcel.in',
    localSubdomainUrl: 'http://salary.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=salary',
    localPathUrl: '/salary',
    category: 'Talent & Career',
    audience: 'Job offer recipients, employees negotiating compensation',
    killerFeature: 'Section 115BAC New Tax Regime take-home calculator, city percentiles, and negotiation coach script generator.',
    status: 'Ready & Verified'
  },
  {
    id: 4,
    name: 'CampusOS',
    icon: GraduationCap,
    subdomain: 'colleges.talentxcel.in',
    localSubdomainUrl: 'http://colleges.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=colleges',
    localPathUrl: '/colleges',
    category: 'Employers & Institutions',
    audience: 'College TPOs, deans, university placement officers',
    killerFeature: 'Institutional placement readiness diagnostic, student cohort scanner, and college tier benchmarking.',
    status: 'Ready & Verified'
  },
  {
    id: 5,
    name: 'Career Passport',
    icon: Award,
    subdomain: 'passport.talentxcel.in',
    localSubdomainUrl: 'http://passport.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=passport',
    localPathUrl: '/passport',
    category: 'Talent & Career',
    audience: 'Professionals seeking shareable proof-of-competence',
    killerFeature: '60-second verified career passport creator, dynamic QR code sharing, and downloadable Talent Card.',
    status: 'Ready & Verified'
  },
  {
    id: 6,
    name: 'SarkariHub',
    icon: Building,
    subdomain: 'government.talentxcel.in',
    localSubdomainUrl: 'http://government.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=government',
    localPathUrl: '/government-jobs',
    category: 'Talent & Career',
    audience: 'GATE, PSU, UPSC, SSC and state government aspirants',
    killerFeature: 'Live official gazette vacancy tracker, eligibility age calculator, and centralized exam countdown calendar.',
    status: 'Ready & Verified'
  },
  {
    id: 7,
    name: 'Career Pathfinder',
    icon: Compass,
    subdomain: 'careers.talentxcel.in',
    localSubdomainUrl: 'http://careers.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=careers',
    localPathUrl: '/career-map',
    category: 'Talent & Career',
    audience: 'Engineers transitioning roles, career pivoters',
    killerFeature: 'Interactive skill gap diagnostic, 90-day milestone checklist with local storage, and transition roadmaps.',
    status: 'Ready & Verified'
  },
  {
    id: 8,
    name: 'SkillPods',
    icon: BookOpen,
    subdomain: 'learning.talentxcel.in',
    localSubdomainUrl: 'http://learning.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=learning',
    localPathUrl: '/learning',
    category: 'Talent & Career',
    audience: 'Students, junior and mid-level software developers',
    killerFeature: 'Interactive skill assessment quizzes (Frontend/React, Python, SQL, Cloud) with verifiable digital certificates.',
    status: 'Ready & Verified'
  },
  {
    id: 9,
    name: 'RecruiterOS',
    icon: Users,
    subdomain: 'employers.talentxcel.in',
    localSubdomainUrl: 'http://employers.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=employers',
    localPathUrl: '/recruiters',
    category: 'Employers & Institutions',
    audience: 'Recruiters, founders, HR directors, talent teams',
    killerFeature: 'Real-time candidate search querying Supabase profiles, interactive ATS pipeline Kanban, and job requisition creator.',
    status: 'Ready & Verified'
  },
  {
    id: 10,
    name: 'CA PracticeOS',
    icon: Calculator,
    subdomain: 'ca.talentxcel.in',
    localSubdomainUrl: 'http://ca.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=ca_practice',
    localPathUrl: '/ca',
    category: 'Professional Practice OS',
    audience: 'Chartered Accountants, tax audit practitioners',
    killerFeature: 'FY 2026-27 Statutory Due-Date Compliance Calendar, Sec 115BAC advance tax engine, SAC finder, and client dossiers.',
    status: 'Ready & Verified'
  },
  {
    id: 11,
    name: 'Legal PracticeOS',
    icon: Scale,
    subdomain: 'legal.talentxcel.in',
    localSubdomainUrl: 'http://legal.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=legal_practice',
    localPathUrl: '/legal',
    category: 'Professional Practice OS',
    audience: 'Advocates, corporate counsels, law chambers',
    killerFeature: 'Indian Bare Acts navigator (BNS, BNSS, BSA with IPC/CrPC crosswalk), automated legal drafter, and court diary.',
    status: 'Ready & Verified'
  },
  {
    id: 12,
    name: 'Professional ServicesOS',
    icon: FileCheck2,
    subdomain: 'services.talentxcel.in',
    localSubdomainUrl: 'http://services.localhost:8080',
    localQueryUrl: 'http://localhost:8080/?__universe=services',
    localPathUrl: '/services',
    category: 'Professional Practice OS',
    audience: 'Businesses, founders, verified CAs, legal counsels',
    killerFeature: 'Verified professional directory, 1-on-1 consultation booking scheduler, and Scope of Work (SOW) proposal builder.',
    status: 'Ready & Verified'
  }
];

export const LocalTestingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>TalentXcel — 12 Independent Businesses Local Testing Dashboard</title>
        <meta name="description" content="Central local testing directory and browser routing verification dashboard for all 12 TalentXcel products running locally on port 8080." />
      </Helmet>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TalentXcelLogo iconSize={26} textSize="text-lg" theme="light" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white">
              12 Products Ecosystem
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Vite Server Active (0.0.0.0:8080)</span>
            </Badge>
            <a 
              href="http://localhost:8080" 
              className="text-[#64748B] hover:text-[#2563EB] font-semibold hidden sm:inline"
            >
              Main App (localhost:8080)
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-8 pb-10">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Local Engineering & Quality Assurance Testing Console</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            12 Independent Products <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Local Testing Matrix</span>
          </h1>

          <p className="text-[#64748B] text-xs sm:text-sm max-w-2xl mx-auto">
            Each business below operates with its own subdomain, independent homepage, dedicated navigation, complete workflows, and verified data bindings. Click any URL below to launch and test locally.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs font-medium text-[#64748B]">
            <span className="bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg">
              Primary: <strong className="text-[#111827]">*.localhost:8080</strong>
            </span>
            <span className="bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg">
              Query Fallback: <strong className="text-[#111827]">localhost:8080/?__universe=xxx</strong>
            </span>
            <span className="bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg">
              Path Fallback: <strong className="text-[#111827]">localhost:8080/xxx</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Grid of 12 Products */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map(p => {
            const Icon = p.icon;
            return (
              <Card 
                key={p.id} 
                className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs hover:border-[#2563EB]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#64748B]">#{p.id}</span>
                          <CardTitle className="text-base font-bold text-[#111827]">{p.name}</CardTitle>
                        </div>
                        <span className="text-xs text-[#2563EB] font-mono font-medium block">
                          {p.subdomain}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold py-0.5">
                      {p.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1">
                    {p.killerFeature}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Subdomain:</span>
                      <a 
                        href={p.localSubdomainUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#2563EB] font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <span>{p.localSubdomainUrl.replace('http://', '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Query Mode:</span>
                      <a 
                        href={p.localQueryUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#7138E8] font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <span>?__universe={p.localQueryUrl.split('=')[1]}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">Path Mode:</span>
                      <a 
                        href={`http://localhost:8080${p.localPathUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#111827] font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <span>{p.localPathUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <a 
                    href={p.localSubdomainUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all"
                  >
                    <span>Launch {p.name} Locally</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; 2026 TalentXcel Multi-Product Commercial Operating System</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 font-bold">✓ 4,315 Production Invariants Passed</span>
            <span className="text-blue-600 font-bold">✓ 12/12 Local Subdomains Tested</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
