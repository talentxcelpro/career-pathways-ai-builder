// src/components/products/jobmatch/JobPortalFooter.tsx
// Comprehensive Employment Marketplace Footer for jobs.talentxcel.in
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React from 'react';
import { Link } from 'react-router-dom';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  BookOpen, 
  FileText, 
  ExternalLink,
  Mail,
  Heart,
  Linkedin
} from 'lucide-react';

export const JobPortalFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-20 pt-16 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Branding */}
        <div className="pb-8 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <TalentXcelLogo />
            <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB]">
              Jobs
            </span>
          </Link>
          <div className="text-xs text-[#64748B]">
            Empowering careers through verified opportunities and AI-powered employment intelligence.
          </div>
        </div>

        {/* 5-Column Sitemap Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
          {/* Column 1: Job Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              <span>Global Categories</span>
            </h4>
            <ul className="space-y-2 text-[#64748B]">
              <li><a href="/jobs?category=it-software" className="hover:text-[#2563EB] transition-colors">Technology, Cloud & AI (360)</a></li>
              <li><a href="/jobs?category=banking-finance" className="hover:text-[#2563EB] transition-colors">Banking, FinTech & FX (240)</a></li>
              <li><a href="/jobs?category=engineering" className="hover:text-[#2563EB] transition-colors">Core Engineering & Semi (160)</a></li>
              <li><a href="/jobs?category=sales-marketing" className="hover:text-[#2563EB] transition-colors">Sales & Global Growth (155)</a></li>
              <li><a href="/jobs?category=ai-data" className="hover:text-[#2563EB] transition-colors">AI & Data Science (145)</a></li>
              <li><a href="/jobs?category=consulting-strategy" className="hover:text-[#2563EB] transition-colors">Consulting & Strategy (130)</a></li>
              <li><a href="/jobs?category=ecommerce-retail" className="hover:text-[#2563EB] transition-colors">Ecommerce & Brands (120)</a></li>
              <li><a href="/jobs?category=supply-chain" className="hover:text-[#2563EB] transition-colors">Supply Chain & Logistics (115)</a></li>
            </ul>
          </div>

          {/* Column 2: Top Locations */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#7138E8]" />
              <span>Global Hubs</span>
            </h4>
            <ul className="space-y-2 text-[#64748B]">
              <li><a href="/jobs?city=remote" className="hover:text-[#7138E8] transition-colors">Worldwide Remote (110)</a></li>
              <li><a href="/jobs?city=dubai" className="hover:text-[#7138E8] transition-colors">Middle East: Dubai & Riyadh (50)</a></li>
              <li><a href="/jobs?city=lagos" className="hover:text-[#7138E8] transition-colors">Africa: Lagos & Nairobi (45)</a></li>
              <li><a href="/jobs?city=south-africa" className="hover:text-[#7138E8] transition-colors">Africa: Cape Town & Joburg (24)</a></li>
              <li><a href="/jobs?city=london" className="hover:text-[#7138E8] transition-colors">Europe: London & Dublin (56)</a></li>
              <li><a href="/jobs?city=berlin" className="hover:text-[#7138E8] transition-colors">Europe: Berlin & Amsterdam (48)</a></li>
              <li><a href="/jobs?city=new-york" className="hover:text-[#7138E8] transition-colors">Americas: New York & Seattle (64)</a></li>
              <li><a href="/jobs?city=bangalore" className="hover:text-[#7138E8] transition-colors">India: Bengaluru & Mumbai (105)</a></li>
            </ul>
          </div>

          {/* Column 3: Companies */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Global Employers</span>
            </h4>
            <ul className="space-y-2 text-[#64748B]">
              <li><a href="/jobs?company=microsoft" className="hover:text-emerald-700 transition-colors">Microsoft & AWS (90)</a></li>
              <li><a href="/jobs?company=revolut" className="hover:text-emerald-700 transition-colors">Revolut & Stripe (54)</a></li>
              <li><a href="/jobs?company=flutterwave" className="hover:text-emerald-700 transition-colors">Flutterwave & Paystack (40)</a></li>
              <li><a href="/jobs?company=careem" className="hover:text-emerald-700 transition-colors">Careem & Aramco Digital (52)</a></li>
              <li><a href="/jobs?company=spotify" className="hover:text-emerald-700 transition-colors">Spotify & ASML (42)</a></li>
              <li><a href="/jobs?company=standard-bank" className="hover:text-emerald-700 transition-colors">Standard Bank & Safaricom (41)</a></li>
              <li><a href="/jobs?company=tcs" className="hover:text-emerald-700 transition-colors">TCS & Infosys (80)</a></li>
              <li><a href="/jobs?company=hdfc" className="hover:text-emerald-700 transition-colors">HDFC Bank & Tata Motors (44)</a></li>
            </ul>
          </div>

          {/* Column 4: Career Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Career Resources</span>
            </h4>
            <ul className="space-y-2 text-[#64748B]">
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">ATS Resume Formatting Guide</a></li>
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">STAR Interview Framework</a></li>
              <li><a href="https://salary.talentxcel.in" className="hover:text-[#2563EB] transition-colors">Salary & CTC Negotiation</a></li>
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">Cross-Skilling & Pivots</a></li>
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">Job Application Protocol</a></li>
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">In-Demand Skills 2026-2027</a></li>
              <li><a href="#resources" className="hover:text-[#2563EB] transition-colors">Campus-to-Corporate Guide</a></li>
            </ul>
          </div>

          {/* Column 5: For Employers & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>For Employers & Legal</span>
            </h4>
            <ul className="space-y-2 text-[#64748B]">
              <li><a href="/post" className="font-bold text-[#2563EB] hover:underline">Post a Vacancy Free →</a></li>
              <li><a href="/talent" className="hover:text-[#2563EB] transition-colors">Search Candidate Graph</a></li>
              <li><a href="/post?view=pipeline" className="hover:text-[#2563EB] transition-colors">Applicant Kanban Pipeline</a></li>
              <li><a href="https://www.linkedin.com/company/talentxcel-services-private-limited/posts/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#0A66C2] hover:underline font-semibold"><Linkedin className="w-3.5 h-3.5" /> Follow on LinkedIn</a></li>
              <li><a href="https://talentxcel.in/privacy" className="hover:text-[#2563EB] transition-colors">Privacy Policy</a></li>
              <li><a href="https://talentxcel.in/terms" className="hover:text-[#2563EB] transition-colors">Terms of Service</a></li>
              <li><a href="https://talentxcel.in/about" className="hover:text-[#2563EB] transition-colors">Job Listing Policy</a></li>
              <li><a href="mailto:support@talentxcel.in" className="hover:text-[#2563EB] transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <div>
            © {new Date().getFullYear()} <strong>TalentXcel Services Pvt Ltd</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/talentxcel-services-private-limited/posts/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0A66C2] hover:underline font-semibold">
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
            <span>•</span>
            <a href="https://talentxcel.in/privacy" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="https://talentxcel.in/terms" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="https://talentxcel.in/about" className="hover:underline">Content Policies</a>
            <span>•</span>
            <span className="text-[11px] text-slate-400">jobs.talentxcel.in (JobMatch OS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
